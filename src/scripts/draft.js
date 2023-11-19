import { supabase } from "../lib/supabase.js";

const { data: products } = await supabase.from("product").select("*");
console.log(products);
