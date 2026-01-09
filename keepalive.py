import os
from supabase import create_client, Client

# Retrieve Supabase credentials from environment variables
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if url and key:
    supabase: Client = create_client(url, key)

    # A simple query to keep the database alive
    # Replace 'your_table_name' with a small, existing table in your DB
    try:
        response = supabase.table('your_table_name').select("id").limit(1).execute()
        print(f"Keep-alive ping successful. Status code: {response.status_code}")
    except Exception as e:
        print(f"Keep-alive ping failed: {e}")
else:
    print("Supabase URL and Key environment variables not set.")

