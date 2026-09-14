from django.db.models.signals import post_save # 1. Import the "After-Save" tripwire trigger
from django.dispatch import receiver          # 2. Import the "Receiver" alert ear
from django.contrib.auth.models import User    # Target the Master User table
from .models import Profile                    # Target your custom Profile table

# 3. Attach the receiver ear directly onto the User table's post_save trigger wire
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # 4. If a brand-new user row was manufactured, build their matching wallet profile!
        Profile.objects.create(user=instance)

# 5. Connect a second listener to make sure data saves cleanly if user data updates
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
