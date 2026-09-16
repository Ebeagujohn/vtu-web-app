import os
import random
import uuid
import requests
from decimal import Decimal

from django.db import models, transaction
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import Profile, Transaction, ServiceProvider, ServicePlan
from .serializers import RegisterSerializer


def build_absolute_media_url(request, file_field):
    if not file_field:
        return None
    url = file_field.url
    return request.build_absolute_uri(url)


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def api_user_register(request):
    translator = RegisterSerializer(data=request.data)
    
    if translator.is_valid():
        user = translator.save()
        assert isinstance(user, User)
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            "message": "User onboarding completed successfully!",
            "token": token.key,
            "username": user.username
        }, status=status.HTTP_201_CREATED)
        
    return Response(translator.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "message": "Login authorization verified!",
            "token": token.key,
            "username": user.username
        }, status=status.HTTP_200_OK)
        
    return Response({
        "error": "Invalid username or password credentials supplied."
    }, status=status.HTTP_401_UNAUTHORIZED)


# ==========================================
# WALLET & LEDGER ENDPOINTS
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_wallet_details(request):
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)

    # Automatically generate sandbox NUBAN accounts if missing
    if not profile.wema_account_number:
        profile.wema_account_number = f"683{random.randint(1000000, 9999999)}"
        profile.moniepoint_account_number = f"682{random.randint(1000000, 9999999)}"
        profile.bank_account_name = f"NOHASUB - {user.username.upper()}"
        profile.save()

    return Response({
        "username": user.username,
        "balance": str(profile.balance),
        "accounts": [
            {
                "bank_name": "MONIEPOINT",
                "account_number": profile.moniepoint_account_number,
                "account_name": profile.bank_account_name,
                "fee": "1%"
            },
            {
                "bank_name": "WEMA BANK",
                "account_number": profile.wema_account_number,
                "account_name": profile.bank_account_name,
                "fee": "1%"
            }
        ]
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_webhook_fund_wallet(request):
    account_number = request.data.get('account_number')
    amount_raw = request.data.get('amount')
    reference = request.data.get('reference')

    if not account_number or not amount_raw or not reference:
        return Response({
            "error": "Missing payload fields: account_number, amount, reference required."
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount = Decimal(str(amount_raw))
    except Exception:
        return Response({
            "error": "Invalid decimal amount supplied."
        }, status=status.HTTP_400_BAD_REQUEST)

    # 1. Idempotency Guard: Stop duplicate webhook processing
    if Transaction.objects.filter(reference=reference).exists():
        return Response({
            "message": "Transaction reference already processed."
        }, status=status.HTTP_200_OK)

    # 2. Locate user profile matching the account number
    try:
        profile = Profile.objects.get(
            models.Q(wema_account_number=account_number) | 
            models.Q(moniepoint_account_number=account_number)
        )
    except Profile.DoesNotExist:
        return Response({
            "error": "No wallet matching provided account number."
        }, status=status.HTTP_404_NOT_FOUND)

    # 3. Atomic Database Ledger Execution
    with transaction.atomic():
        fee = amount * Decimal('0.01')  # 1% gateway service charge
        credit_amount = amount - fee

        balance_before = profile.balance
        balance_after = balance_before + credit_amount

        profile.balance = balance_after
        profile.save()

        Transaction.objects.create(
            user=profile.user,
            transaction_type='CREDIT',
            service_type='WALLET_FUNDING',
            amount=credit_amount,
            fee=fee,
            balance_before=balance_before,
            balance_after=balance_after,
            reference=reference,
            description=f"Automated Bank Transfer via {account_number}",
            status='SUCCESSFUL'
        )

    return Response({
        "status": "success",
        "message": f"Successfully credited ₦{credit_amount} to {profile.user.username}'s wallet.",
        "new_balance": str(profile.balance)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_demo_fund_wallet(request):
    """
    Demo/Test Endpoint: Instantly credits ₦10,000 to the requesting user's wallet.
    """
    try:
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        amount = Decimal('10000.00')

        with transaction.atomic():
            profile = Profile.objects.select_for_update().get(id=profile.pk)

            balance_before = profile.balance
            balance_after = balance_before + amount

            profile.balance = balance_after
            profile.save()

            tx_ref = f"DEMO-{uuid.uuid4().hex[:8].upper()}"
            Transaction.objects.create(
                user=user,
                transaction_type='CREDIT',
                service_type='WALLET_FUNDING',
                amount=amount,
                fee=Decimal('0.00'),
                balance_before=balance_before,
                balance_after=balance_after,
                reference=tx_ref,
                description="Instant Demo Wallet Top-Up (₦10,000.00)",
                status='SUCCESSFUL',
                meta_data={"source": "demo_button"}
            )

        return Response({
            "status": "success",
            "message": f"Successfully credited ₦{amount:.2f} demo funds to your wallet!",
            "new_balance": str(profile.balance),
            "reference": tx_ref
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Demo fund failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==========================================
# UTILITY PURCHASES (AIRTIME, DATA, CABLE, ELECTRICITY)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_buy_airtime(request):
    user = request.user
    
    network = request.data.get('network')
    phone_number = request.data.get('phone_number')
    amount_raw = request.data.get('amount')
    pin = request.data.get('pin')

    if not all([network, phone_number, amount_raw, pin]):
        return Response({
            "error": "Missing required fields: network, phone_number, amount, pin."
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount = Decimal(str(amount_raw))
        if amount < 50:
            return Response({"error": "Minimum airtime purchase is ₦50."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response({"error": "Invalid amount format."}, status=status.HTTP_400_BAD_REQUEST)

    profile = Profile.objects.get(user=user)
    
    if not profile.transaction_pin:
        return Response({
            "error": "No Transaction PIN set on this account. Please set a PIN in your profile."
        }, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(str(pin), profile.transaction_pin):
        return Response({"error": "Incorrect Transaction PIN."}, status=status.HTTP_403_FORBIDDEN)

    if profile.balance < amount:
        return Response({"error": "Insufficient wallet balance."}, status=status.HTTP_400_BAD_REQUEST)

    tx_reference = f"AIRT-{uuid.uuid4().hex[:10].upper()}"

    # Atomic Ledger Debit
    with transaction.atomic():
        balance_before = profile.balance
        balance_after = balance_before - amount

        profile.balance = balance_after
        profile.save()

        tx_record = Transaction.objects.create(
            user=user,
            transaction_type='DEBIT',
            service_type='AIRTIME',
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            reference=tx_reference,
            description=f"Airtime Topup - {network.upper()} - {phone_number}",
            status='PENDING',
            meta_data={
                "network": network,
                "phone_number": phone_number,
                "provider": "CLUBKONNECT"
            }
        )

    # 🌟 REAL CLUBKONNECT TELECOM DISPATCH
    USER_ID = os.environ.get("CLUBKONNECT_USER_ID")
    API_KEY = os.environ.get("CLUBKONNECT_API_KEY")

    if USER_ID and API_KEY:
        network_map = {
            'mtn': '01',
            'glo': '02',
            '9mobile': '03',
            'airtel': '04'
        }
        net_code = network_map.get(str(network).lower(), '01')
        
        ck_url = f"https://www.clubkonnect.com/API/Airtime/?UserID={USER_ID.strip()}&APIKey={API_KEY.strip()}&MobileNetwork={net_code}&Amount={int(amount)}&MobileNumber={phone_number}&RequestID={tx_reference}"

        # 🌟 Browser User-Agent Header to bypass Cloudflare block
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }

        error_msg = ""
        try:
            ck_res = requests.get(ck_url, headers=headers, timeout=25)
            print(f"📡 CLUBKONNECT RESPONSE ({ck_res.status_code}): {ck_res.text[:200]}")
            
            # Safely parse JSON or text
            try:
                res_json = ck_res.json()
                status_code = str(res_json.get("statuscode", res_json.get("status", "")))
                
                if status_code in ["100", "200", "ORDER_RECEIVED", "SUCCESS"]:
                    provider_success = True
                else:
                    provider_success = False
                    error_msg = res_json.get("msg", res_json.get("status", f"ClubKonnect code: {status_code}"))
            except Exception:
                # Response was plain text or HTML instead of JSON
                provider_success = False
                raw_text = ck_res.text.strip()
                if "ORDER_RECEIVED" in raw_text or "SUCCESS" in raw_text:
                    provider_success = True
                else:
                    error_msg = f"ClubKonnect response: {raw_text[:120]}"
        except Exception as e:
            print(f"❌ ClubKonnect Request Exception: {str(e)}")
            provider_success = False
            error_msg = str(e)
    else:
        # Fallback to simulation mode if keys are not set
        provider_success = True
        error_msg = ""

    if provider_success:
        tx_record.status = 'SUCCESSFUL'
        tx_record.save()
        
        return Response({
            "status": "success",
            "message": f"Successfully recharged ₦{amount} to {phone_number} ({network.upper()}).",
            "reference": tx_record.reference,
            "new_balance": str(profile.balance)
        }, status=status.HTTP_200_OK)
    else:
        # Auto-Refund Wallet on Failure
        with transaction.atomic():
            profile.balance += amount
            profile.save()
            tx_record.status = 'FAILED'
            tx_record.description += " (Failed & Refunded)"
            tx_record.save()

        return Response({
            "error": f"ClubKonnect: {error_msg}. Your ₦{amount} has been refunded to your wallet."
        }, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_data_plans(request):
    user_tier = request.user.profile.user_tier
    providers = ServiceProvider.objects.filter(service_type='DATA', is_active=True)

    catalog = []
    for provider in providers:
        plans = ServicePlan.objects.filter(provider=provider, is_active=True)
        plan_list = []
        
        for plan in plans:
            charge_price = (
                plan.price_reseller
                if user_tier == 'RESELLER'
                else plan.price_regular
            )
            
            plan_list.append({
                "id": plan.pk,
                "name": plan.name,
                "plan_code": plan.plan_code,
                "price": str(charge_price)
            })

        catalog.append({
            "provider_id": provider.pk,
            "network": provider.name,
            "code": provider.code,
            "plans": plan_list
        })

    return Response({
        "user_tier": user_tier,
        "catalog": catalog
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_buy_data(request):
    user = request.user
    
    plan_id = request.data.get('plan_id')
    phone_number = request.data.get('phone_number')
    pin = request.data.get('pin')

    if not all([plan_id, phone_number, pin]):
        return Response({"error": "Missing required fields: plan_id, phone_number, pin."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        plan = ServicePlan.objects.get(id=plan_id, is_active=True)
    except ServicePlan.DoesNotExist:
        return Response({"error": "Selected data plan is invalid or unavailable."}, status=status.HTTP_404_NOT_FOUND)

    profile = Profile.objects.get(user=user)
    
    if not profile.transaction_pin:
        return Response({"error": "No Transaction PIN set on this account."}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(str(pin), profile.transaction_pin):
        return Response({"error": "Incorrect Transaction PIN."}, status=status.HTTP_403_FORBIDDEN)

    charge_amount = plan.price_reseller if profile.user_tier == 'RESELLER' else plan.price_regular

    if profile.balance < charge_amount:
        return Response({"error": f"Insufficient wallet balance. Plan costs ₦{charge_amount}."}, status=status.HTTP_400_BAD_REQUEST)

    tx_reference = f"DATA-{uuid.uuid4().hex[:10].upper()}"

    with transaction.atomic():
        balance_before = profile.balance
        balance_after = balance_before - charge_amount

        profile.balance = balance_after
        profile.save()

        tx_record = Transaction.objects.create(
            user=user,
            transaction_type='DEBIT',
            service_type='DATA',
            amount=charge_amount,
            balance_before=balance_before,
            balance_after=balance_after,
            reference=tx_reference,
            description=f"Data Purchase - {plan.provider.name} {plan.name} to {phone_number}",
            status='PENDING',
            meta_data={
                "network": plan.provider.name,
                "plan_name": plan.name,
                "plan_code": plan.plan_code,
                "phone_number": phone_number,
                "tier_applied": profile.user_tier,
                "provider": "MOCK_PROVIDER"
            }
        )

    provider_success = True

    if provider_success:
        tx_record.status = 'SUCCESSFUL'
        tx_record.save()
        return Response({
            "status": "success",
            "message": f"Successfully sent {plan.provider.name} {plan.name} to {phone_number}.",
            "reference": tx_record.reference,
            "new_balance": str(profile.balance)
        }, status=status.HTTP_200_OK)
    else:
        tx_record.status = 'FAILED'
        tx_record.save()
        return Response({"error": "Data fulfillment failed. Contact support."}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_cable_plans(request):
    user_tier = request.user.profile.user_tier
    providers = ServiceProvider.objects.filter(service_type='CABLE', is_active=True)

    catalog = []
    for provider in providers:
        plans = ServicePlan.objects.filter(provider=provider, is_active=True)
        plan_list = []
        
        for plan in plans:
            charge_price = plan.price_reseller if user_tier == 'RESELLER' else plan.price_regular
            
            plan_list.append({
                "id": plan.pk,
                "name": plan.name,
                "plan_code": plan.plan_code,
                "price": str(charge_price)
            })

        catalog.append({
            "provider_id": provider.pk,
            "provider_name": provider.name,
            "code": provider.code,
            "plans": plan_list
        })

    return Response({
        "catalog": catalog
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_buy_cable(request):
    user = request.user
    
    plan_id = request.data.get('plan_id')
    iuc_number = request.data.get('iuc_number')
    phone_number = request.data.get('phone_number')
    pin = request.data.get('pin')

    if not all([plan_id, iuc_number, phone_number, pin]):
        return Response({"error": "Missing required fields: plan_id, iuc_number, phone_number, pin."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        plan = ServicePlan.objects.get(id=plan_id, is_active=True)
    except ServicePlan.DoesNotExist:
        return Response({"error": "Selected Cable subscription package is invalid."}, status=status.HTTP_404_NOT_FOUND)

    profile = Profile.objects.get(user=user)
    
    if not profile.transaction_pin:
        return Response({"error": "No Transaction PIN set on this account."}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(str(pin), profile.transaction_pin):
        return Response({"error": "Incorrect Transaction PIN."}, status=status.HTTP_403_FORBIDDEN)

    charge_amount = plan.price_reseller if profile.user_tier == 'RESELLER' else plan.price_regular

    if profile.balance < charge_amount:
        return Response({"error": f"Insufficient wallet balance. Subscription costs ₦{charge_amount}."}, status=status.HTTP_400_BAD_REQUEST)

    tx_reference = f"CABL-{uuid.uuid4().hex[:10].upper()}"

    with transaction.atomic():
        balance_before = profile.balance
        balance_after = balance_before - charge_amount

        profile.balance = balance_after
        profile.save()

        tx_record = Transaction.objects.create(
            user=user,
            transaction_type='DEBIT',
            service_type='CABLE',
            amount=charge_amount,
            balance_before=balance_before,
            balance_after=balance_after,
            reference=tx_reference,
            description=f"Cable TV - {plan.provider.name} {plan.name} (IUC: {iuc_number})",
            status='PENDING',
            meta_data={
                "provider": plan.provider.name,
                "plan_name": plan.name,
                "plan_code": plan.plan_code,
                "iuc_number": iuc_number,
                "phone_number": phone_number,
                "tier_applied": profile.user_tier,
            }
        )

    provider_success = True

    if provider_success:
        tx_record.status = 'SUCCESSFUL'
        tx_record.save()
        return Response({
            "status": "success",
            "message": f"Successfully activated {plan.provider.name} {plan.name} for IUC {iuc_number}.",
            "reference": tx_record.reference,
            "new_balance": str(profile.balance)
        }, status=status.HTTP_200_OK)
    else:
        tx_record.status = 'FAILED'
        tx_record.save()
        return Response({"error": "Cable activation failed. Please contact support."}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_electricity_providers(request):
    providers = ServiceProvider.objects.filter(service_type='ELECTRICITY', is_active=True)
    
    provider_list = [
        {
            "id": p.pk,
            "name": p.name,
            "code": p.code
        }
        for p in providers
    ]

    return Response({"providers": provider_list}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_buy_electricity(request):
    user = request.user
    
    provider_code = request.data.get('provider_code')
    meter_type = request.data.get('meter_type')
    meter_number = request.data.get('meter_number')
    phone_number = request.data.get('phone_number')
    amount_raw = request.data.get('amount')
    pin = request.data.get('pin')

    if not all([provider_code, meter_type, meter_number, phone_number, amount_raw, pin]):
        return Response({
            "error": "Missing required fields: provider_code, meter_type, meter_number, phone_number, amount, pin."
        }, status=status.HTTP_400_BAD_REQUEST)

    if meter_type not in ['PREPAID', 'POSTPAID']:
        return Response({"error": "Invalid meter_type. Must be PREPAID or POSTPAID."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount = Decimal(str(amount_raw))
        if amount < 500:
            return Response({"error": "Minimum electricity purchase is ₦500."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response({"error": "Invalid amount supplied."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        provider = ServiceProvider.objects.get(code=provider_code, service_type='ELECTRICITY', is_active=True)
    except ServiceProvider.DoesNotExist:
        return Response({"error": "Selected DisCo electricity provider is invalid."}, status=status.HTTP_404_NOT_FOUND)

    profile = Profile.objects.get(user=user)
    
    if not profile.transaction_pin:
        return Response({"error": "No Transaction PIN set on this account."}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(str(pin), profile.transaction_pin):
        return Response({"error": "Incorrect Transaction PIN."}, status=status.HTTP_403_FORBIDDEN)

    if profile.balance < amount:
        return Response({"error": f"Insufficient wallet balance. Total charge is ₦{amount}."}, status=status.HTTP_400_BAD_REQUEST)

    tx_reference = f"ELEC-{uuid.uuid4().hex[:10].upper()}"
    
    mock_token = None
    if meter_type == 'PREPAID':
        raw_digits = "".join([str(random.randint(0, 9)) for _ in range(20)])
        mock_token = f"{raw_digits[:4]}-{raw_digits[4:8]}-{raw_digits[8:12]}-{raw_digits[12:16]}-{raw_digits[16:]}"

    with transaction.atomic():
        balance_before = profile.balance
        balance_after = balance_before - amount

        profile.balance = balance_after
        profile.save()

        tx_record = Transaction.objects.create(
            user=user,
            transaction_type='DEBIT',
            service_type='ELECTRICITY',
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            reference=tx_reference,
            description=f"Electricity Bill - {provider.name} ({meter_type}) - Meter: {meter_number}",
            status='PENDING',
            meta_data={
                "disco_name": provider.name,
                "disco_code": provider.code,
                "meter_type": meter_type,
                "meter_number": meter_number,
                "phone_number": phone_number,
                "meter_token": mock_token,
                "units": f"{amount / Decimal('75.00'):.1f} kWh"
            }
        )

    provider_success = True

    if provider_success:
        tx_record.status = 'SUCCESSFUL'
        tx_record.save()
        
        response_payload = {
            "status": "success",
            "message": f"Successfully paid ₦{amount} for {provider.name} meter {meter_number}.",
            "reference": tx_record.reference,
            "new_balance": str(profile.balance),
            "meter_type": meter_type
        }
        
        if mock_token:
            response_payload["token"] = mock_token
            response_payload["units"] = tx_record.meta_data.get("units")

        return Response(response_payload, status=status.HTTP_200_OK)
    else:
        tx_record.status = 'FAILED'
        tx_record.save()
        return Response({"error": "Electricity bill payment failed. Please contact support."}, status=status.HTTP_502_BAD_GATEWAY)


# ==========================================
# HISTORY & PROFILE MANAGEMENT
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_transaction_history(request):
    user = request.user
    transactions = Transaction.objects.filter(user=user).order_by('-created_at')

    history_list = []
    for tx in transactions:
        history_list.append({
            "id": tx.pk,
            "reference": tx.reference,
            "transaction_type": tx.transaction_type,
            "service_type": tx.service_type,
            "amount": str(tx.amount),
            "fee": str(tx.fee),
            "balance_before": str(tx.balance_before),
            "balance_after": str(tx.balance_after),
            "description": tx.description,
            "status": tx.status,
            "meta_data": tx.meta_data,
            "date": tx.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return Response({
        "count": len(history_list),
        "transactions": history_list
    }, status=status.HTTP_200_OK)   


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def api_user_profile(request):
    user = request.user
    profile = Profile.objects.get(user=user)

    if request.method == "GET":
        return Response({
            "username": user.username,
            "email": user.email or "",
            "full_name": profile.full_name or "",
            "phone_number": profile.phone_number or "",
            "user_tier": profile.user_tier,
            "balance": str(profile.balance),
            "bank_account_name": profile.bank_account_name or "",
            "has_transaction_pin": bool(profile.transaction_pin),
            "profile_picture": build_absolute_media_url(request, profile.profile_picture),
        }, status=status.HTTP_200_OK)

    # PATCH identity fields (username/email/name/phone)
    new_username = request.data.get("username")
    full_name = request.data.get("full_name")
    phone_number = request.data.get("phone_number")
    email = request.data.get("email")

    if new_username and new_username.strip() != user.username:
        if User.objects.filter(username=new_username.strip()).exists():
            return Response(
                {"error": "This username is already taken. Please choose another."},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.username = new_username.strip()

    if full_name is not None:
        profile.full_name = str(full_name).strip()
    if phone_number is not None:
        profile.phone_number = str(phone_number).strip()
    if email is not None:
        user.email = str(email).strip()

    user.save()
    profile.save()

    return Response({
        "message": "Profile updated successfully.",
        "username": user.username,
        "email": user.email or "",
        "full_name": profile.full_name or "",
        "phone_number": profile.phone_number or "",
        "user_tier": profile.user_tier,
        "balance": str(profile.balance),
        "bank_account_name": profile.bank_account_name or "",
        "has_transaction_pin": bool(profile.transaction_pin),
        "profile_picture": build_absolute_media_url(request, profile.profile_picture),
    }, status=status.HTTP_200_OK)


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def api_profile_picture(request):
    profile = Profile.objects.get(user=request.user)

    if request.method == "DELETE":
        if profile.profile_picture:
            profile.profile_picture.delete(save=False)
            profile.profile_picture = None  # type: ignore
            profile.save()
        return Response({
            "message": "Profile picture removed.",
            "profile_picture": None
        }, status=status.HTTP_200_OK)

    image = request.FILES.get("profile_picture")
    if not image:
        return Response(
            {"error": "No image file provided. Use form field name: profile_picture"},
            status=status.HTTP_400_BAD_REQUEST
        )

    valid_types = ["image/jpeg", "image/png", "image/webp"]
    if image.content_type not in valid_types:
        return Response(
            {"error": "Invalid file type. Use JPG, PNG, or WEBP."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if image.size > 2 * 1024 * 1024:
        return Response(
            {"error": "Image too large. Max size is 2MB."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if profile.profile_picture:
        profile.profile_picture.delete(save=False)

    profile.profile_picture = image
    profile.save()

    return Response({
        "message": "Profile picture updated successfully.",
        "profile_picture": build_absolute_media_url(request, profile.profile_picture),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_change_transaction_pin(request):
    user = request.user
    profile = Profile.objects.get(user=user)

    old_pin = request.data.get('old_pin')
    new_pin = request.data.get('new_pin')
    confirm_pin = request.data.get('confirm_pin')

    if not all([old_pin, new_pin, confirm_pin]):
        return Response({
            "error": "old_pin, new_pin, and confirm_pin are required."
        }, status=status.HTTP_400_BAD_REQUEST)

    if not str(new_pin).isdigit() or len(str(new_pin)) != 4:
        return Response({"error": "New PIN must be exactly 4 digits."}, status=status.HTTP_400_BAD_REQUEST)

    if str(new_pin) != str(confirm_pin):
        return Response({"error": "New PIN and confirmation do not match."}, status=status.HTTP_400_BAD_REQUEST)

    if not profile.transaction_pin or not check_password(str(old_pin), profile.transaction_pin):
        return Response({"error": "Old transaction PIN is incorrect."}, status=status.HTTP_403_FORBIDDEN)

    profile.transaction_pin = make_password(str(new_pin))
    profile.save()

    return Response({"message": "Transaction PIN updated successfully."}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not all([old_password, new_password, confirm_password]):
        return Response({"error": "old_password, new_password, and confirm_password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(old_password):
        return Response({"error": "Current login password is incorrect."}, status=status.HTTP_403_FORBIDDEN)

    if new_password != confirm_password:
        return Response({"error": "New password and confirmation do not match."}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 6:
        return Response({"error": "New password must be at least 6 characters long."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Login password changed successfully. Please log in again with your new password."}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_upgrade_reseller(request):
    user = request.user
    profile = Profile.objects.get(user=user)

    if profile.user_tier == 'RESELLER':
        return Response({"error": "You are already an active Reseller."}, status=status.HTTP_400_BAD_REQUEST)

    pin = request.data.get('pin')
    if not profile.transaction_pin or not check_password(str(pin), profile.transaction_pin):
        return Response({"error": "Incorrect Transaction PIN."}, status=status.HTTP_403_FORBIDDEN)

    UPGRADE_FEE = Decimal('1000.00')

    if profile.balance < UPGRADE_FEE:
        return Response({"error": f"Insufficient balance. Reseller upgrade costs ₦{UPGRADE_FEE}."}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        balance_before = profile.balance
        balance_after = balance_before - UPGRADE_FEE

        profile.balance = balance_after
        profile.user_tier = 'RESELLER'
        profile.save()

        tx_reference = f"UPG-{uuid.uuid4().hex[:10].upper()}"
        Transaction.objects.create(
            user=user,
            transaction_type='DEBIT',
            service_type='WALLET_FUNDING',
            amount=UPGRADE_FEE,
            balance_before=balance_before,
            balance_after=balance_after,
            reference=tx_reference,
            description="Account Upgrade to Reseller Tier",
            status='SUCCESSFUL'
        )

    return Response({
        "message": "Congratulations! Your account is now upgraded to Reseller Tier.",
        "new_tier": "RESELLER",
        "new_balance": str(profile.balance)
    }, status=status.HTTP_200_OK)