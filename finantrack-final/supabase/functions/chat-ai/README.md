# Chat AI — Edge Function

## Desplegar en Supabase

1. Instala Supabase CLI:
   npm install -g supabase

2. Login:
   supabase login

3. Link tu proyecto:
   supabase link --project-ref ivszfufrmvffbgatytnk

4. Agrega tu API key de Anthropic como secreto:
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-TU_CLAVE_AQUI

5. Despliega la función:
   supabase functions deploy chat-ai

Obtén tu API key de Anthropic en: https://console.anthropic.com/
