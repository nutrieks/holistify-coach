import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('🌱 Starting test data seeding...')

    // Get first client
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .limit(1)
      .single()

    if (clientsError || !clients) {
      throw new Error('No clients found')
    }

    console.log('✅ Found client:', clients.id)

    // Get food IDs
    const { data: foods, error: foodsError } = await supabaseAdmin
      .from('food_database')
      .select('id, name')
      .limit(15)

    if (foodsError || !foods || foods.length === 0) {
      throw new Error('No food items found')
    }

    console.log(`✅ Found ${foods.length} food items`)

    // Create meal plan
    const { data: mealPlan, error: planError } = await supabaseAdmin
      .from('meal_plans')
      .insert({
        client_id: clients.id,
        name: 'Test Plan - Lean Bulk',
        start_date: '2025-01-01',
        end_date: '2025-03-31',
        daily_calories_target: 2800,
        daily_protein_target: 180,
        daily_carbs_target: 320,
        daily_fats_target: 90,
        training_integration: true,
        view_mode: 'weekly',
        notes: 'Test plan sa svim vrstama obroka i treninga',
        is_active: true
      })
      .select()
      .single()

    if (planError) {
      throw planError
    }

    console.log('✅ Created meal plan:', mealPlan.id)

    // Map food items for easier use
    const foodMap: Record<string, string> = {}
    foods.forEach(food => {
      foodMap[food.name] = food.id
    })

    // Create meal entries for the week
    const mealEntries = []
    
    // Monday (0)
    mealEntries.push(
      { meal_plan_id: mealPlan.id, day_of_week: 0, meal_type: 'Doručak', food_id: foodMap['Ovsene pahuljice'], quantity: 80, unit: 'g', scheduled_time: '08:00', meal_gradient_color: 'from-amber-500 to-orange-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 0, meal_type: 'Užina 1', food_id: foodMap['Banana'], quantity: 1, unit: 'komad', scheduled_time: '10:30', meal_gradient_color: 'from-yellow-400 to-amber-400' },
      { meal_plan_id: mealPlan.id, day_of_week: 0, meal_type: 'Ručak', food_id: foodMap['Piletina prsa'], quantity: 200, unit: 'g', scheduled_time: '13:00', meal_gradient_color: 'from-emerald-500 to-teal-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 0, meal_type: 'Ručak', food_id: foodMap['Bijela riža'], quantity: 150, unit: 'g', scheduled_time: '13:00', meal_gradient_color: 'from-emerald-500 to-teal-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 0, meal_type: 'Večera', food_id: foodMap['Losos'], quantity: 180, unit: 'g', scheduled_time: '19:00', meal_gradient_color: 'from-blue-500 to-indigo-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 0, meal_type: 'Večera', food_id: foodMap['Slatki krumpir'], quantity: 200, unit: 'g', scheduled_time: '19:00', meal_gradient_color: 'from-blue-500 to-indigo-500' }
    )

    // Tuesday (1)
    mealEntries.push(
      { meal_plan_id: mealPlan.id, day_of_week: 1, meal_type: 'Doručak', food_id: foodMap['Jaja'], quantity: 3, unit: 'komada', scheduled_time: '08:00', meal_gradient_color: 'from-amber-500 to-orange-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 1, meal_type: 'Doručak', food_id: foodMap['Avokado'], quantity: 50, unit: 'g', scheduled_time: '08:00', meal_gradient_color: 'from-amber-500 to-orange-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 1, meal_type: 'Užina 1', food_id: foodMap['Grčki jogurt'], quantity: 200, unit: 'g', scheduled_time: '10:30', meal_gradient_color: 'from-yellow-400 to-amber-400' },
      { meal_plan_id: mealPlan.id, day_of_week: 1, meal_type: 'Ručak', food_id: foodMap['Pečena tuna'], quantity: 200, unit: 'g', scheduled_time: '13:00', meal_gradient_color: 'from-emerald-500 to-teal-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 1, meal_type: 'Užina 2', food_id: foodMap['Protein shake'], quantity: 1, unit: 'scoop', scheduled_time: '16:00', meal_gradient_color: 'from-purple-400 to-pink-400', notes: 'Post-workout' },
      { meal_plan_id: mealPlan.id, day_of_week: 1, meal_type: 'Večera', food_id: foodMap['Piletina prsa'], quantity: 180, unit: 'g', scheduled_time: '19:00', meal_gradient_color: 'from-blue-500 to-indigo-500' }
    )

    // Wednesday (2) - Rest day, lighter meals
    mealEntries.push(
      { meal_plan_id: mealPlan.id, day_of_week: 2, meal_type: 'Doručak', food_id: foodMap['Grčki jogurt'], quantity: 250, unit: 'g', scheduled_time: '08:00', meal_gradient_color: 'from-amber-500 to-orange-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 2, meal_type: 'Doručak', food_id: foodMap['Bademi'], quantity: 30, unit: 'g', scheduled_time: '08:00', meal_gradient_color: 'from-amber-500 to-orange-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 2, meal_type: 'Ručak', food_id: foodMap['Losos'], quantity: 150, unit: 'g', scheduled_time: '13:00', meal_gradient_color: 'from-emerald-500 to-teal-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 2, meal_type: 'Ručak', food_id: foodMap['Spanać'], quantity: 200, unit: 'g', scheduled_time: '13:00', meal_gradient_color: 'from-emerald-500 to-teal-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 2, meal_type: 'Večera', food_id: foodMap['Piletina prsa'], quantity: 180, unit: 'g', scheduled_time: '19:00', meal_gradient_color: 'from-blue-500 to-indigo-500' }
    )

    // Thursday (3)
    mealEntries.push(
      { meal_plan_id: mealPlan.id, day_of_week: 3, meal_type: 'Doručak', food_id: foodMap['Ovsene pahuljice'], quantity: 80, unit: 'g', scheduled_time: '08:00', meal_gradient_color: 'from-amber-500 to-orange-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 3, meal_type: 'Doručak', food_id: foodMap['Banana'], quantity: 1, unit: 'komad', scheduled_time: '08:00', meal_gradient_color: 'from-amber-500 to-orange-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 3, meal_type: 'Užina 1', food_id: foodMap['Protein shake'], quantity: 1, unit: 'scoop', scheduled_time: '10:30', meal_gradient_color: 'from-yellow-400 to-amber-400' },
      { meal_plan_id: mealPlan.id, day_of_week: 3, meal_type: 'Ručak', food_id: foodMap['Piletina prsa'], quantity: 200, unit: 'g', scheduled_time: '13:00', meal_gradient_color: 'from-emerald-500 to-teal-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 3, meal_type: 'Ručak', food_id: foodMap['Bijela riža'], quantity: 180, unit: 'g', scheduled_time: '13:00', meal_gradient_color: 'from-emerald-500 to-teal-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 3, meal_type: 'Večera', food_id: foodMap['Pečena tuna'], quantity: 200, unit: 'g', scheduled_time: '19:00', meal_gradient_color: 'from-blue-500 to-indigo-500' }
    )

    // Friday (4)
    mealEntries.push(
      { meal_plan_id: mealPlan.id, day_of_week: 4, meal_type: 'Doručak', food_id: foodMap['Jaja'], quantity: 3, unit: 'komada', scheduled_time: '08:00', meal_gradient_color: 'from-amber-500 to-orange-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 4, meal_type: 'Doručak', food_id: foodMap['Integral kruh'], quantity: 80, unit: 'g', scheduled_time: '08:00', meal_gradient_color: 'from-amber-500 to-orange-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 4, meal_type: 'Užina 1', food_id: foodMap['Banana'], quantity: 1, unit: 'komad', scheduled_time: '10:30', meal_gradient_color: 'from-yellow-400 to-amber-400' },
      { meal_plan_id: mealPlan.id, day_of_week: 4, meal_type: 'Ručak', food_id: foodMap['Losos'], quantity: 180, unit: 'g', scheduled_time: '13:00', meal_gradient_color: 'from-emerald-500 to-teal-500' },
      { meal_plan_id: mealPlan.id, day_of_week: 4, meal_type: 'Užina 2', food_id: foodMap['Protein shake'], quantity: 1, unit: 'scoop', scheduled_time: '16:00', meal_gradient_color: 'from-purple-400 to-pink-400' },
      { meal_plan_id: mealPlan.id, day_of_week: 4, meal_type: 'Večera', food_id: foodMap['Piletina prsa'], quantity: 200, unit: 'g', scheduled_time: '19:00', meal_gradient_color: 'from-blue-500 to-indigo-500' }
    )

    // Insert all meal entries
    const { error: entriesError } = await supabaseAdmin
      .from('meal_plan_entries')
      .insert(mealEntries)

    if (entriesError) {
      throw entriesError
    }

    console.log(`✅ Created ${mealEntries.length} meal entries`)

    // Create training sessions
    const trainingSessions = [
      // Monday - Upper Body
      {
        meal_plan_id: mealPlan.id,
        day_of_week: 0,
        training_type: 'Upper Body',
        intensity: 'high',
        scheduled_time: '15:00',
        duration_minutes: 75,
        gradient_color: 'from-red-500 to-pink-500',
        pre_workout_notes: 'Dobar warm-up 10min',
        during_workout_notes: 'Fokus na chest i back',
        post_workout_notes: 'Stretching 10min'
      },
      // Tuesday - Lower Body
      {
        meal_plan_id: mealPlan.id,
        day_of_week: 1,
        training_type: 'Lower Body',
        intensity: 'high',
        scheduled_time: '15:00',
        duration_minutes: 60,
        gradient_color: 'from-orange-500 to-red-500',
        pre_workout_notes: 'Leg mobility 15min',
        during_workout_notes: 'Squats i deadlifts fokus',
        post_workout_notes: 'Foam rolling'
      },
      // Wednesday - REST
      // Thursday - Push
      {
        meal_plan_id: mealPlan.id,
        day_of_week: 3,
        training_type: 'Push Day',
        intensity: 'medium',
        scheduled_time: '15:00',
        duration_minutes: 60,
        gradient_color: 'from-blue-500 to-purple-500',
        pre_workout_notes: 'Shoulder warm-up',
        during_workout_notes: 'Chest, shoulders, triceps',
        post_workout_notes: 'Cool down'
      },
      // Friday - Pull
      {
        meal_plan_id: mealPlan.id,
        day_of_week: 4,
        training_type: 'Pull Day',
        intensity: 'medium',
        scheduled_time: '15:00',
        duration_minutes: 60,
        gradient_color: 'from-green-500 to-teal-500',
        pre_workout_notes: 'Back activation',
        during_workout_notes: 'Back i biceps fokus',
        post_workout_notes: 'Stretching'
      }
    ]

    const { error: sessionsError } = await supabaseAdmin
      .from('training_sessions')
      .insert(trainingSessions)

    if (sessionsError) {
      throw sessionsError
    }

    console.log(`✅ Created ${trainingSessions.length} training sessions`)

    // Create daily training types
    const dailyTypes = [
      { meal_plan_id: mealPlan.id, day_of_week: 0, training_day_type: 'high', macro_adjustment: { calories: 200, protein: 10, carbs: 30, fats: 5 } },
      { meal_plan_id: mealPlan.id, day_of_week: 1, training_day_type: 'high', macro_adjustment: { calories: 200, protein: 10, carbs: 30, fats: 5 } },
      { meal_plan_id: mealPlan.id, day_of_week: 2, training_day_type: 'rest', macro_adjustment: { calories: -200, protein: -10, carbs: -40, fats: 0 } },
      { meal_plan_id: mealPlan.id, day_of_week: 3, training_day_type: 'medium', macro_adjustment: { calories: 100, protein: 5, carbs: 15, fats: 3 } },
      { meal_plan_id: mealPlan.id, day_of_week: 4, training_day_type: 'medium', macro_adjustment: { calories: 100, protein: 5, carbs: 15, fats: 3 } },
      { meal_plan_id: mealPlan.id, day_of_week: 5, training_day_type: 'rest', macro_adjustment: { calories: -200, protein: -10, carbs: -40, fats: 0 } },
      { meal_plan_id: mealPlan.id, day_of_week: 6, training_day_type: 'low', macro_adjustment: { calories: 0, protein: 0, carbs: 0, fats: 0 } }
    ]

    const { error: typesError } = await supabaseAdmin
      .from('daily_training_types')
      .insert(dailyTypes)

    if (typesError) {
      throw typesError
    }

    console.log(`✅ Created ${dailyTypes.length} daily training types`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test data created successfully!',
        data: {
          mealPlanId: mealPlan.id,
          clientId: clients.id,
          mealEntriesCount: mealEntries.length,
          trainingSessionsCount: trainingSessions.length,
          dailyTypesCount: dailyTypes.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
