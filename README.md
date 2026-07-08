## Commands
### First-time setup 
<pre>
npm install
npm run dev
</pre>

### Configure your keys
<pre>
cp .env.example .env.local
</pre>

Open .env.local and configure the keys
<pre>
AI_PROVIDER=nvidia
NVIDIA_API_KEY=<your key from build.nvidia.com>
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
SEARCH_PROVIDER=tavily
TAVILY_API_KEY=<your.api.key>
</pre>

### Development
<pre>npm run dev</pre>