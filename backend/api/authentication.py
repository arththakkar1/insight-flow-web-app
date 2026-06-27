from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CookieJWTAuthentication(JWTAuthentication):
    """
    Reads JWT access token from the 'access_token' HttpOnly cookie.
    Falls back to the Authorization header for backwards compatibility.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get('access_token')

        if raw_token is None:
            # Fall back to standard Authorization header
            return super().authenticate(request)

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, TokenError):
            return None
