import threading
import requests
import os
from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags

# 🌟 Get your Free Resend API Key from https://resend.com (3,000 free emails/month)
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")


def _send_email_worker(subject, html_content, recipient_email):
    """
    Executes in a background thread so it NEVER blocks Django or Gunicorn.
    """
    if not recipient_email:
        return

    plain_content = strip_tags(html_content)

    # 1️⃣ Option A: Resend HTTP API (Recommended for Render — uses HTTPS Port 443, never blocked)
    if RESEND_API_KEY:
        try:
            requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": "NOHASub <onboarding@resend.dev>",
                    "to": [recipient_email],
                    "subject": subject,
                    "html": html_content,
                },
                timeout=10,
            )
            return
        except Exception as e:
            print(f"Resend HTTP API failed: {e}")

    # 2️⃣ Option B: Django Standard SMTP (Fallback)
    try:
        send_mail(
            subject=subject,
            message=plain_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            html_message=html_content,
            fail_silently=True,
        )
    except Exception as e:
        print(f"SMTP Email send failed: {e}")


def send_welcome_email(user):
    """Triggers welcome email in background thread (0ms API delay)."""
    if not user.email:
        return

    subject = f"Welcome to NOHASub, {user.username}! 🎉"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #059669; margin-top: 0;">Welcome to NOHASub!</h2>
        <p>Hi <strong>{user.username}</strong>,</p>
        <p>Your account has been successfully created. Thank you for joining NOHASub!</p>
        <p>You can now enjoy instant automated VTU services:</p>
        <ul style="color: #334155; line-height: 1.6;">
            <li>Cheap Data Bundles (MTN, Airtel, Glo, 9mobile)</li>
            <li>Instant Airtime Recharge</li>
            <li>Cable TV Subscriptions (DSTV, GOTV, Startimes)</li>
            <li>Electricity Tokens & Utility Payments</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© NOHASub. All rights reserved.</p>
    </div>
    """

    # 🌟 RUN IN BACKGROUND THREAD — DOES NOT BLOCK API RESPONSE
    thread = threading.Thread(
        target=_send_email_worker,
        args=(subject, html_content, user.email)
    )
    thread.daemon = True
    thread.start()


def send_receipt_email(user, service_type, amount, recipient, reference, token=None, units=None):
    """Triggers transaction receipt in background thread (0ms API delay)."""
    if not user.email:
        return

    subject = f"Receipt: ₦{amount:,.2f} - {service_type}"

    extra_details = ""
    if token:
        extra_details += f"""
        <tr>
            <td style="padding: 8px 0; color: #64748b;">Electricity Token</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #059669; font-size: 16px;">{token}</td>
        </tr>
        """
    if units:
        extra_details += f"""
        <tr>
            <td style="padding: 8px 0; color: #64748b;">Units Generated</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #0f172a;">{units}</td>
        </tr>
        """

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #059669; margin: 0;">Transaction Successful</h2>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">NOHASub Digital Purchase Receipt</p>
        </div>

        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                    <td style="padding: 8px 0; color: #64748b;">Service</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #0f172a;">{service_type}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b;">Beneficiary / Target</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #0f172a;">{recipient}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b;">Amount Paid</td>
                    <td style="padding: 8px 0; font-weight: bold; font-size: 16px; text-align: right; color: #059669;">₦{amount:,.2f}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b;">Reference ID</td>
                    <td style="padding: 8px 0; font-family: monospace; text-align: right; color: #334155;">{reference}</td>
                </tr>
                {extra_details}
                <tr>
                    <td style="padding: 8px 0; color: #64748b;">Status</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #059669;">SUCCESSFUL</td>
                </tr>
            </table>
        </div>

        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            Thank you for choosing NOHASub! If you have any questions, please reply to this email.
        </p>
    </div>
    """

    # 🌟 RUN IN BACKGROUND THREAD — DOES NOT BLOCK API RESPONSE
    thread = threading.Thread(
        target=_send_email_worker,
        args=(subject, html_content, user.email)
    )
    thread.daemon = True
    thread.start()