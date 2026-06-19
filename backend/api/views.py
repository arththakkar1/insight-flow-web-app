from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .llm_client import LMStudioClient

class ChatMessageView(APIView):
    def post(self, request):
        user_message = request.data.get("message")
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        client = LMStudioClient()
        messages = [
            {"role": "system", "content": "You are InsightFlow AI Analytics Assistant."},
            {"role": "user", "content": user_message}
        ]
        
        try:
            reply = client.generate_chat_response(messages)
            return Response({"reply": reply})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
