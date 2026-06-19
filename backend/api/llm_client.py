import openai

class LMStudioClient:
    def __init__(self, base_url="http://localhost:1234/v1", api_key="lm-studio"):
        self.client = openai.OpenAI(
            base_url=base_url,
            api_key=api_key
        )

    def generate_chat_response(self, messages, model="qwen2.5-coder-14b-instruct"):
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7
        )
        return response.choices[0].message.content

    def generate_dax_measure(self, dataset_info, target_metric, model="qwen2.5-coder-14b-instruct"):
        prompt = f"Given this dataset context: {dataset_info}, generate a Power BI DAX formula for: {target_metric}."
        messages = [
            {"role": "system", "content": "You are a senior data analyst and DAX expert."},
            {"role": "user", "content": prompt}
        ]
        return self.generate_chat_response(messages, model)
