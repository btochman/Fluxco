import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, password, name, companyName, contactName, phone, city, country } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (type === 'employee') {
      // Validate @fluxco.com email
      if (!email.toLowerCase().endsWith('@fluxco.com')) {
        return NextResponse.json({ error: 'Only @fluxco.com email addresses can register' }, { status: 400 });
      }

      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }

      // Check if email exists
      const { data: existing } = await supabaseAdmin
        .from('employee_users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
      }

      // Create employee
      const { data, error } = await supabaseAdmin
        .from('employee_users')
        .insert({
          email: email.toLowerCase(),
          password_hash: password,
          name: name,
          role: 'engineer',
        })
        .select()
        .single();

      if (error) {
        console.error('Employee signup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ user: data });

    } else if (type === 'supplier') {
      if (!companyName || !contactName) {
        return NextResponse.json({ error: 'Company name and contact name are required' }, { status: 400 });
      }

      // Check if email exists
      const { data: existing } = await supabaseAdmin
        .from('suppliers')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
      }

      // Create supplier
      const { data, error } = await supabaseAdmin
        .from('suppliers')
        .insert({
          email: email.toLowerCase(),
          password_hash: password,
          company_name: companyName,
          contact_name: contactName,
          phone: phone || null,
          city: city || null,
          country: country || 'USA',
          is_verified: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Supplier signup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ user: data });
    }

    return NextResponse.json({ error: 'Invalid signup type' }, { status: 400 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
