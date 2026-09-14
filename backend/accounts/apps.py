from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    # 1. FIXED: Tell Django to wake up our signals sensors on boot up
    def ready(self):
        import accounts.signals # 🌟 CORRECT
