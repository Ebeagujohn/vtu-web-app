from django.urls import path
from . import views
from .views import (
    api_user_register, 
    api_user_login, 
    api_get_wallet_details, 
    api_webhook_fund_wallet,
    api_buy_airtime,
    api_get_data_plans, 
    api_buy_data,
    api_get_cable_plans,
    api_buy_cable,
    api_get_electricity_providers, 
    api_buy_electricity,
    api_get_transaction_history,
    api_user_profile,
    api_change_transaction_pin,
    api_profile_picture,
    api_change_password,
    api_upgrade_reseller,
    api_demo_fund_wallet
)

urlpatterns = [
    path('register/', api_user_register, name='api_register'),
    path('login/', api_user_login, name='api_login'),
    path('wallet/', api_get_wallet_details, name='api_wallet'),
    path('webhook/fund/', api_webhook_fund_wallet, name='api_webhook_fund'),
    path('airtime/buy/', api_buy_airtime, name='api_buy_airtime'),
    path('data/plans/', api_get_data_plans, name='api_data_plans'), 
    path('data/buy/', api_buy_data, name='api_buy_data'), 
    path('cable/plans/', api_get_cable_plans, name='api_cable_plans'), 
    path('cable/buy/', api_buy_cable, name='api_buy_cable'),
    path('electricity/providers/', api_get_electricity_providers, name='api_electricity_providers'), 
    path('electricity/buy/', api_buy_electricity, name='api_buy_electricity'),
    path('transactions/history/', api_get_transaction_history, name='api_transaction_history'),
    path('profile/', api_user_profile, name='api_user_profile'),
    path('profile/change-pin/', api_change_transaction_pin, name='api_change_pin'),
    path("profile/picture/", api_profile_picture, name="api_profile_picture"),
    path('profile/change-password/', api_change_password, name='api_change_password'),
        path('profile/upgrade/', api_upgrade_reseller, name='api_upgrade_reseller'),
]
