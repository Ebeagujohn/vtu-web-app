from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    # --- USER TIERS FOR PRICING ---
    USER_TIERS = (
        ('REGULAR', 'Regular User'),
        ('RESELLER', 'Reseller'),
        ('API_USER', 'API Partner'),
    )

    # 1. Core relationship and financial ledger
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    user_tier = models.CharField(max_length=20, choices=USER_TIERS, default='REGULAR')
    
    # 2. Expanded Onboarding Identity Fields
    full_name = models.CharField(max_length=150, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # 3. Security Authorization
    transaction_pin = models.CharField(max_length=128, blank=True, null=True)

    # 4. Dedicated Virtual Account Details 
    moniepoint_account_number = models.CharField(max_length=10, blank=True, null=True)
    wema_account_number = models.CharField(max_length=10, blank=True, null=True)
    bank_account_name = models.CharField(max_length=150, blank=True, null=True)
    # Optional profile photo
    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True
        )

    def __str__(self):
        return f"{self.user.username}'s Wallet — ₦{self.balance} ({self.user_tier})"


class ServiceProvider(models.Model):
    SERVICE_CHOICES = (
        ('AIRTIME', 'Airtime'),
        ('DATA', 'Data'),
        ('CABLE', 'Cable TV'),
        ('ELECTRICITY', 'Electricity'),
    )
    name = models.CharField(max_length=50) # e.g., "MTN", "DSTV", "IKEDC"
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES)
    code = models.CharField(max_length=20, unique=True) # e.g., "mtn_airtime"
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.service_type})"


class ServicePlan(models.Model):
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='plans')
    name = models.CharField(max_length=100) # e.g., "1GB SME Data - 30 Days"
    plan_code = models.CharField(max_length=50, unique=True) # e.g., "mtn_1gb_sme"
    
    face_value = models.DecimalField(max_digits=10, decimal_places=2)
    price_regular = models.DecimalField(max_digits=10, decimal_places=2)
    price_reseller = models.DecimalField(max_digits=10, decimal_places=2)
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} | Reg: ₦{self.price_regular} | Reseller: ₦{self.price_reseller}"


class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('CREDIT', 'Credit / Wallet Funding'),
        ('DEBIT', 'Debit / Utility Purchase'),
    )

    SERVICE_TYPES = (
        ('WALLET_FUNDING', 'Wallet Funding'),
        ('AIRTIME', 'Airtime'),
        ('DATA', 'Data'),
        ('CABLE', 'Cable TV'),
        ('ELECTRICITY', 'Electricity'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SUCCESSFUL', 'Successful'),
        ('FAILED', 'Failed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES, default='WALLET_FUNDING')
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    balance_before = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    
    reference = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    
    # NEW: Stores flexible data like phone number, meter token, network, etc.
    meta_data = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} | {self.service_type} | ₦{self.amount} | {self.status}"