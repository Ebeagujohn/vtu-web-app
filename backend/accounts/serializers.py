from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Profile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    full_name = serializers.CharField(write_only=True, required=True)
    phone_number = serializers.CharField(write_only=True, required=True)
    transaction_pin = serializers.CharField(write_only=True, required=True, max_length=4)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'phone_number', 'transaction_pin']

    def create(self, validated_data):
        extracted_full_name = validated_data.pop('full_name')
        extracted_phone = validated_data.pop('phone_number')
        extracted_pin = validated_data.pop('transaction_pin')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )

        # 🌟 FIXED: Explicitly query Profile via ORM to satisfy Pylance
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.full_name = extracted_full_name
        profile.phone_number = extracted_phone
        profile.transaction_pin = make_password(extracted_pin)
        profile.save()

        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['balance', 'phone_number', 'full_name']