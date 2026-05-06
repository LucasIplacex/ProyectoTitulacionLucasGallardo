import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://qghbnprmgkumovpeqcpd.supabase.co";
const SUPABASE_KEY = "sb_publishable_MGmf5Mr3o_2tCCJ0723MJg_hO705kgs";

export const client = createClient(SUPABASE_URL, SUPABASE_KEY);