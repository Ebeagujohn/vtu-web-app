from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import Profile, Transaction
import uuid

class Command(BaseCommand):
    help = "Fund a user's wallet easily for testing and demo purposes."

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the account to fund')
        parser.add_argument('amount', type=float, help='Amount in Naira to credit')

    def handle(self, *args, **options):
        username = options['username']
        amount = Decimal(str(options['amount']))

        try:
            user = User.objects.get(username=username)
            profile, _ = Profile.objects.get_or_create(user=user)

            balance_before = profile.balance
            balance_after = balance_before + amount

            profile.balance = balance_after
            profile.save()

            # Record in Ledger
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
                description=f"Demo CLI Wallet Credit (₦{amount})",
                status='SUCCESSFUL'
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"🎉 Successfully credited ₦{amount:.2f} to @{username}! New Balance: ₦{profile.balance:.2f}"
                )
            )
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"❌ User with username '{username}' does not exist."))