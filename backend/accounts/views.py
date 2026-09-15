import random
from decimal import Decimal
from django.db import models, transaction
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
import uuid
from django.contrib.auth.hashers import check_password, make_password
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import Profile, Transaction
from .serializers import RegisterSerializer
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import Profile, Transaction, ServiceProvider, ServicePlan

def build_absolute_media_url(request, file_field):
    if not file_field:
        return None
    url = file_field.url
    return request.build_absolute_uri(url)

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
def api_buy_airtime(request):
    user = request.user
    
    # 1. Extract payload from frontend
    network = request.data.get('network')
    phone_number = request.data.get('phone_number')
    amount_raw = request.data.get('amount')
    pin = request.data.get('pin')

    # 2. Basic Validation
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

        # 3. Fetch Profile & Verify Security PIN
    profile = Profile.objects.get(user=user)
    
    if not profile.transaction_pin:
        return Response({
            "error": "No Transaction PIN set on this account. Please set a PIN in your profile."
        }, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(str(pin), profile.transaction_pin):
        return Response({"error": "Incorrect Transaction PIN."}, status=status.HTTP_403_FORBIDDEN)

    # 4. Check Wallet Balance
    if profile.balance < amount:
        return Response({"error": "Insufficient wallet balance."}, status=status.HTTP_400_BAD_REQUEST)

    # Generate unique transaction reference
    tx_reference = f"AIRT-{uuid.uuid4().hex[:10].upper()}"

    # 5. Atomic Ledger Transaction (Deduct Wallet & Log DB)
    with transaction.atomic():
        balance_before = profile.balance
        balance_after = balance_before - amount

        # Deduct balance
        profile.balance = balance_after
        profile.save()

        # Create Transaction Record (PENDING initially)
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
                "provider": "MOCK_VTPASS" # We will change this to real API later
            }
        )

    # 6. SIMULATED PROVIDER API CALL 
    # (Imagine this block sends data to VTPass/ClubKonnect)
    # --- MOCK START ---
    provider_success = True 
    # --- MOCK END ---

    # 7. Post-Provider Logic
    if provider_success:
        tx_record.status = 'SUCCESSFUL'
        tx_record.save()
        
        return Response({
            "status": "success",
            "message": f"Successfully recharged ₦{amount} to {phone_number} ({network}).",
            "reference": tx_record.reference,
            "new_balance": str(profile.balance)
        }, status=status.HTTP_200_OK)
    else:
        # If upstream fails, we leave it as PENDING for admin refund (As agreed in Business Rules)
        tx_record.status = 'FAILED' # Or PENDING based on exact telecom rules
        tx_record.save()
        return Response({
            "error": "Provider failed to deliver airtime. Transaction is under review."
        }, status=status.HTTP_502_BAD_GATEWAY)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_data_plans(request):
    """
    Returns active data providers and their available plans with tier pricing customized for the requesting user.
    """
    user_tier = request.user.profile.user_tier
    providers = ServiceProvider.objects.filter(service_type='DATA', is_active=True)

    catalog = []
    for provider in providers:
        plans = ServicePlan.objects.filter(provider=provider, is_active=True)
        plan_list = []
        
        for plan in plans:
            # Determine price based on user tier
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

    # 1. Fetch Plan
    try:
        plan = ServicePlan.objects.get(id=plan_id, is_active=True)
    except ServicePlan.DoesNotExist:
        return Response({"error": "Selected data plan is invalid or unavailable."}, status=status.HTTP_404_NOT_FOUND)

    # 2. Fetch Profile & Verify Security PIN
    profile = Profile.objects.get(user=user)
    
    if not profile.transaction_pin:
        return Response({"error": "No Transaction PIN set on this account."}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(str(pin), profile.transaction_pin):
        return Response({"error": "Incorrect Transaction PIN."}, status=status.HTTP_403_FORBIDDEN)

    # 3. Calculate Price based on User Tier
    charge_amount = plan.price_reseller if profile.user_tier == 'RESELLER' else plan.price_regular

    # 4. Check Wallet Balance
    if profile.balance < charge_amount:
        return Response({"error": f"Insufficient wallet balance. Plan costs ₦{charge_amount}."}, status=status.HTTP_400_BAD_REQUEST)

    tx_reference = f"DATA-{uuid.uuid4().hex[:10].upper()}"

    # 5. Atomic Ledger Execution
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
                "provider": "MOCK_VTPASS"
            }
        )

    # 6. SIMULATED FULFILLMENT
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
    """
    Returns active Cable TV providers and their subscription packages.
    """
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

    # 1. Fetch Cable Plan
    try:
        plan = ServicePlan.objects.get(id=plan_id, is_active=True)
    except ServicePlan.DoesNotExist:
        return Response({"error": "Selected Cable subscription package is invalid."}, status=status.HTTP_404_NOT_FOUND)

    # 2. Fetch Profile & Verify Security PIN
    profile = Profile.objects.get(user=user)
    
    if not profile.transaction_pin:
        return Response({"error": "No Transaction PIN set on this account."}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(str(pin), profile.transaction_pin):
        return Response({"error": "Incorrect Transaction PIN."}, status=status.HTTP_403_FORBIDDEN)

    # 3. Calculate Price
    charge_amount = plan.price_reseller if profile.user_tier == 'RESELLER' else plan.price_regular

    # 4. Check Wallet Balance
    if profile.balance < charge_amount:
        return Response({"error": f"Insufficient wallet balance. Subscription costs ₦{charge_amount}."}, status=status.HTTP_400_BAD_REQUEST)

    tx_reference = f"CABL-{uuid.uuid4().hex[:10].upper()}"

    # 5. Atomic Ledger Execution
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

    # 6. SIMULATED FULFILLMENT
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
    """
    Returns active electricity DisCo distribution providers.
    """
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
    meter_type = request.data.get('meter_type') # 'PREPAID' or 'POSTPAID'
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

    # 1. Fetch DisCo Provider
    try:
        provider = ServiceProvider.objects.get(code=provider_code, service_type='ELECTRICITY', is_active=True)
    except ServiceProvider.DoesNotExist:
        return Response({"error": "Selected DisCo electricity provider is invalid."}, status=status.HTTP_404_NOT_FOUND)

    # 2. Fetch Profile & Verify Security PIN
    profile = Profile.objects.get(user=user)
    
    if not profile.transaction_pin:
        return Response({"error": "No Transaction PIN set on this account."}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(str(pin), profile.transaction_pin):
        return Response({"error": "Incorrect Transaction PIN."}, status=status.HTTP_403_FORBIDDEN)

    # 3. Check Wallet Balance
    if profile.balance < amount:
        return Response({"error": f"Insufficient wallet balance. Total charge is ₦{amount}."}, status=status.HTTP_400_BAD_REQUEST)

    tx_reference = f"ELEC-{uuid.uuid4().hex[:10].upper()}"
    
    # Generate 20-digit electricity token for PREPAID meters
    mock_token = None
    if meter_type == 'PREPAID':
        raw_digits = "".join([str(random.randint(0, 9)) for _ in range(20)])
        mock_token = f"{raw_digits[:4]}-{raw_digits[4:8]}-{raw_digits[8:12]}-{raw_digits[12:16]}-{raw_digits[16:]}"

    # 4. Atomic Ledger Execution
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
                "units": f"{amount / Decimal('75.00'):.1f} kWh" # Estimated units calculation
            }
        )

    # 5. SIMULATED FULFILLMENT
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
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_transaction_history(request):
    """
    Returns a complete reverse-chronological ledger history of all 
    credits, debits, and utility purchases for the logged-in user.
    """
    user = request.user
    transactions = Transaction.objects.filter(user=user).order_by('-created_at')

    history_list = []
    for tx in transactions:
        history_list.append({
            "id": tx.pk,
            "reference": tx.reference,
            "transaction_type": tx.transaction_type, # CREDIT or DEBIT
            "service_type": tx.service_type,         # AIRTIME, DATA, CABLE, ELECTRICITY, WALLET_FUNDING
            "amount": str(tx.amount),
            "fee": str(tx.fee),
            "balance_before": str(tx.balance_before),
            "balance_after": str(tx.balance_after),
            "description": tx.description,
            "status": tx.status,                     # SUCCESSFUL, PENDING, FAILED
            "meta_data": tx.meta_data,               # Contains phone numbers, tokens, IUC, etc.
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
    """
    POST   -> upload/replace optional profile picture
    DELETE -> remove profile picture
    """
    profile = Profile.objects.get(user=request.user)

    if request.method == "DELETE":
        if profile.profile_picture:
            profile.profile_picture.delete(save=False)
            profile.profile_picture = None # type: ignore
            profile.save()
        return Response({
            "message": "Profile picture removed.",
            "profile_picture": None
        }, status=status.HTTP_200_OK)

    # POST upload
    image = request.FILES.get("profile_picture")
    if not image:
        return Response(
            {"error": "No image file provided. Use form field name: profile_picture"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Basic validation
    valid_types = ["image/jpeg", "image/png", "image/webp"]
    if image.content_type not in valid_types:
        return Response(
            {"error": "Invalid file type. Use JPG, PNG, or WEBP."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2MB limit
    if image.size > 2 * 1024 * 1024:
        return Response(
            {"error": "Image too large. Max size is 2MB."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Replace old image if exists
    if profile.profile_picture:
        profile.profile_picture.delete(save=False)

    profile.profile_picture = image
    profile.save()

    return Response({
        "message": "Profile picture updated successfully.",
        "profile_picture": build_absolute_media_url(request, profile.profile_picture),
    }, status=status.HTTP_200_OK)

    # PATCH — update identity fields
    new_username = request.data.get('username')
    full_name = request.data.get('full_name')
    phone_number = request.data.get('phone_number')
    email = request.data.get('email')

    # 🌟 NEW: Handle Username Change with Uniqueness Check
    if new_username and new_username.strip() != user.username:
        if User.objects.filter(username=new_username.strip()).exists():
            return Response({"error": "This username is already taken. Please choose another."}, status=status.HTTP_400_BAD_REQUEST)
        user.username = new_username.strip()

    if full_name is not None:
        profile.full_name = full_name.strip()
    if phone_number is not None:
        profile.phone_number = phone_number.strip()
    if email is not None:
        user.email = email.strip()
        
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

    # Validate PIN for upgrade
    pin = request.data.get('pin')
    if not profile.transaction_pin or not check_password(str(pin), profile.transaction_pin):
        return Response({"error": "Incorrect Transaction PIN."}, status=status.HTTP_403_FORBIDDEN)

    UPGRADE_FEE = Decimal('1000.00')

    if profile.balance < UPGRADE_FEE:
        return Response({"error": f"Insufficient balance. Reseller upgrade costs ₦{UPGRADE_FEE}."}, status=status.HTTP_400_BAD_REQUEST)

    # Atomic Ledger Deduction
    with transaction.atomic():
        balance_before = profile.balance
        balance_after = balance_before - UPGRADE_FEE

        profile.balance = balance_after
        profile.user_tier = 'RESELLER'
        profile.save()

        # Log transaction
        tx_reference = f"UPG-{uuid.uuid4().hex[:10].upper()}"
        Transaction.objects.create(
            user=user,
            transaction_type='DEBIT',
            service_type='WALLET_FUNDING', # Or a new type 'UPGRADE'
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
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_demo_fund_wallet(request):
    """
    Demo/Test Endpoint: Instantly credits ₦10,000 to the requesting user's wallet.
    """
    user = request.user
    profile = Profile.objects.get(user=user)
    amount = Decimal('10000.00')

    with transaction.atomic():
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
            status='SUCCESSFUL'
        )

    return Response({
        "status": "success",
        "message": f"Successfully credited ₦{amount:.2f} demo funds to your wallet!",
        "new_balance": str(profile.balance)
    }, status=status.HTTP_200_OK)