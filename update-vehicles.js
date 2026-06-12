import { supabase } from './src/utils/supabaseClient.js';

async function updateSchema() {
  const { error } = await supabase.rpc('query', { 
    sql: `ALTER TABLE public.vehicles ADD COLUMN meta_data JSONB DEFAULT '{}'::jsonb;` 
  });
  console.log(error ? error.message : "Success");
}
// updateSchema();
