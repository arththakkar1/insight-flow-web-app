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

    def generate_chat_response(self, messages, model="openrouter/pareto-code"):
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content

    def generate_dax_measure(self, dataset_info, target_metric, model="openrouter/pareto-code"):
        prompt = f"Given this dataset context: {dataset_info}, generate a Power BI DAX formula for: {target_metric}."
        messages = [
            {"role": "system", "content": "You are a senior data analyst and DAX expert."},
            {"role": "user", "content": prompt}
        ]
        return self.generate_chat_response(messages, model)

    def generate_report_config(self, dataset_info, model="openrouter/pareto-code"):
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
            "Ensure you provide 3 visuals and 3 DAX measures."
        )
        messages = [
            {"role": "user", "content": prompt}
        ]
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.3,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content
