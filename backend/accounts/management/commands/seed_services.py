from decimal import Decimal
from django.core.management.base import BaseCommand
from accounts.models import ServiceProvider, ServicePlan


class Command(BaseCommand):
    help = "Seed Data, Cable, and Electricity providers/plans for demo testing."

    def handle(self, *args, **options):
        self.stdout.write("Seeding NOHASub service catalog...")

        # =========================
        # DATA PROVIDERS + PLANS
        # =========================
        mtn, _ = ServiceProvider.objects.get_or_create(
            code="mtn_data",
            defaults={"name": "MTN", "service_type": "DATA", "is_active": True},
        )
        airtel, _ = ServiceProvider.objects.get_or_create(
            code="airtel_data",
            defaults={"name": "Airtel", "service_type": "DATA", "is_active": True},
        )
        glo, _ = ServiceProvider.objects.get_or_create(
            code="glo_data",
            defaults={"name": "Glo", "service_type": "DATA", "is_active": True},
        )
        nine, _ = ServiceProvider.objects.get_or_create(
            code="9mobile_data",
            defaults={"name": "9mobile", "service_type": "DATA", "is_active": True},
        )

        data_plans = [
            (mtn, "500MB SME (30 Days)", "mtn-500mb", "150", "150", "140"),
            (mtn, "1.0GB SME (30 Days)", "mtn-1gb", "300", "300", "280"),
            (mtn, "2.0GB SME (30 Days)", "mtn-2gb", "600", "600", "560"),
            (mtn, "5.0GB SME (30 Days)", "mtn-5gb", "1500", "1500", "1400"),
            (airtel, "1.0GB Corporate (30 Days)", "airtel-1gb", "320", "320", "300"),
            (airtel, "2.0GB Corporate (30 Days)", "airtel-2gb", "640", "640", "600"),
            (glo, "1.0GB Direct (30 Days)", "glo-1gb", "350", "350", "330"),
            (nine, "1.0GB Social (30 Days)", "9mobile-1gb", "300", "300", "280"),
        ]

        for provider, name, code, face, regular, reseller in data_plans:
            ServicePlan.objects.get_or_create(
                plan_code=code,
                defaults={
                    "provider": provider,
                    "name": name,
                    "face_value": Decimal(face),
                    "price_regular": Decimal(regular),
                    "price_reseller": Decimal(reseller),
                    "is_active": True,
                },
            )

        # =========================
        # CABLE PROVIDERS + PLANS
        # =========================
        dstv, _ = ServiceProvider.objects.get_or_create(
            code="dstv",
            defaults={"name": "DStv", "service_type": "CABLE", "is_active": True},
        )
        gotv, _ = ServiceProvider.objects.get_or_create(
            code="gotv",
            defaults={"name": "GOtv", "service_type": "CABLE", "is_active": True},
        )
        startimes, _ = ServiceProvider.objects.get_or_create(
            code="startimes",
            defaults={"name": "Startimes", "service_type": "CABLE", "is_active": True},
        )

        cable_plans = [
            (gotv, "GOtv Smallie", "gotv-smallie", "1300", "1300", "1250"),
            (gotv, "GOtv Jinja", "gotv-jinja", "2700", "2700", "2600"),
            (gotv, "GOtv Jolli", "gotv-jolli", "3950", "3950", "3850"),
            (gotv, "GOtv Max", "gotv-max", "5700", "5700", "5550"),
            (dstv, "DStv Yanga", "dstv-yanga", "4200", "4200", "4100"),
            (dstv, "DStv Confam", "dstv-confam", "7400", "7400", "7250"),
            (dstv, "DStv Compact", "dstv-compact", "12500", "12500", "12300"),
            (startimes, "Startimes Nova", "startimes-nova", "1500", "1500", "1450"),
            (startimes, "Startimes Basic", "startimes-basic", "2600", "2600", "2500"),
        ]

        for provider, name, code, face, regular, reseller in cable_plans:
            ServicePlan.objects.get_or_create(
                plan_code=code,
                defaults={
                    "provider": provider,
                    "name": name,
                    "face_value": Decimal(face),
                    "price_regular": Decimal(regular),
                    "price_reseller": Decimal(reseller),
                    "is_active": True,
                },
            )

        # =========================
        # ELECTRICITY DISCOS
        # =========================
        discos = [
            ("Ikeja Electric (IKEDC)", "ikedc"),
            ("Eko Electric (EKEDC)", "ekedc"),
            ("Ibadan Electric (IBEDC)", "ibedc"),
            ("Abuja Electric (AEDC)", "aedc"),
            ("Kano Electric (KEDCO)", "kedco"),
            ("Port Harcourt Electric (PHED)", "phed"),
            ("Kaduna Electric (KAEDCO)", "kaedco"),
            ("Jos Electric (JED)", "jed"),
        ]

        for name, code in discos:
            ServiceProvider.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "service_type": "ELECTRICITY",
                    "is_active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS("✅ Service catalog seeded successfully!"))
        self.stdout.write(f"Providers: {ServiceProvider.objects.count()}")
        self.stdout.write(f"Plans: {ServicePlan.objects.count()}")