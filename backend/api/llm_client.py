import openai
import os

try:
    from .secrets import OPENROUTER_API_KEY
except ImportError:
    OPENROUTER_API_KEY = None

class OpenRouterClient:
    def __init__(self, base_url="https://openrouter.ai/api/v1", api_key=None):
        if not api_key:
            api_key = OPENROUTER_API_KEY or os.environ.get("OPENROUTER_API_KEY")
            
        if not api_key or api_key == "your-api-key-here":
            raise ValueError(
                "OpenRouter API key is missing. Please set OPENROUTER_API_KEY "
                "in backend/api/secrets.py or as an environment variable."
            )

        self.client = openai.OpenAI(
            base_url=base_url,
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "InsightFlow"
            }
        )

    def get_fallback_models(self, preferred_model):
        return [
            preferred_model,
            "meta-llama/llama-3.1-8b-instruct:free",
            "google/gemma-2-9b-it:free",
            "mistralai/mistral-nemo:free",
            "microsoft/phi-3-mini-128k-instruct:free",
            "qwen/qwen-2.5-7b-instruct:free"
        ]

    def generate_chat_response(self, messages, model="cohere/north-mini-code:free"):
        models_to_try = self.get_fallback_models(model)
        
        for idx, current_model in enumerate(models_to_try):
            try:
                response = self.client.chat.completions.create(
                    model=current_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000
                )
                return response.choices[0].message.content
            except Exception as e:
                # If it's the last model in the fallback list, raise the exception
                if idx == len(models_to_try) - 1:
                    raise e
                print(f"Model {current_model} failed with error: {e}. Trying next fallback...")

    def generate_dax_measure(self, dataset_info, target_metric, model="cohere/north-mini-code:free"):
        prompt = f"Given this dataset context: {dataset_info}, generate a Power BI DAX formula for: {target_metric}."
        messages = [
            {"role": "system", "content": "You are a senior data analyst and DAX expert."},
            {"role": "user", "content": prompt}
        ]
        return self.generate_chat_response(messages, model)

    def generate_report_config(self, dataset_info, model="cohere/north-mini-code:free"):
        prompt = (
            f"You are an expert BI Data Architect. Given the following dataset schema: {dataset_info}, "
            "design a dashboard with logical visualizations and DAX measures.\n"
            "Return EXACTLY AND ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "visuals_data": [\n'
            '    {"type": "BarChart" | "LineChart" | "PieChart", "title": "Chart Title", "description": "Brief axis/legend info"}\n'
            "  ],\n"
            '  "dax_data": [\n'
            '    {"name": "Measure Name", "formula": "Valid DAX Expression"}\n'
            "  ]\n"
            "}\n"
            "Ensure you provide a maximum of 6 logical visuals and a maximum of 5 DAX measures."
        )
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        models_to_try = self.get_fallback_models(model)
        for idx, current_model in enumerate(models_to_try):
            try:
                response = self.client.chat.completions.create(
                    model=current_model,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=1500,
                    response_format={"type": "json_object"}
                )
                return response.choices[0].message.content
            except Exception as e:
                if idx == len(models_to_try) - 1:
                    raise e
                print(f"Model {current_model} failed with error: {e}. Trying next fallback...")
