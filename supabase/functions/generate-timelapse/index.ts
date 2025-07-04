// supabase/functions/generate-timelapse/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Time-lapse generation function started')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { challengeId, userId, photos, isEarly } = await req.json()
    console.log('Received request:', { challengeId, userId, photoCount: photos.length, isEarly })
    
    if (!challengeId || !userId || !photos || photos.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: need challengeId, userId, and at least 2 photos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // For now, we'll create a simple time-lapse record and simulate processing
    // In a real implementation, this would:
    // 1. Download all the images from storage
    // 2. Use FFmpeg or similar to create a video
    // 3. Upload the video to storage
    // 4. Return the video URL

    const timelapseData = {
      challenge_id: challengeId,
      user_id: userId,
      video_url: '', // Will be populated after processing
      thumbnail_url: photos[0].image_url, // Use first photo as thumbnail
      duration_seconds: Math.floor(photos.length * 0.5), // 0.5 seconds per photo
      photo_count: photos.length,
      date_range_start: photos[0].taken_at.split('T')[0],
      date_range_end: photos[photos.length - 1].taken_at.split('T')[0],
      processing_status: 'processing',
      is_public: false
    }

    // Insert time-lapse record
    const { data: timelapseRecord, error: insertError } = await supabase
      .from('timelapse_videos')
      .insert(timelapseData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting time-lapse record:', insertError)
      throw insertError
    }

    console.log('Time-lapse record created:', timelapseRecord.id)

    // Simulate video processing (in real implementation, this would be done asynchronously)
    setTimeout(async () => {
      try {
        // Simulate video generation - in reality, this would:
        // 1. Download images from Supabase storage
        // 2. Create video using FFmpeg
        // 3. Upload video back to storage
        
        const mockVideoUrl = `timelapse-videos/${userId}/${challengeId}/timelapse-${Date.now()}.mp4`
        
        // Update record with completed status and video URL
        await supabase
          .from('timelapse_videos')
          .update({
            video_url: mockVideoUrl,
            processing_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', timelapseRecord.id)

        console.log('Time-lapse processing completed:', mockVideoUrl)
      } catch (error) {
        console.error('Error in background processing:', error)
        
        // Mark as failed
        await supabase
          .from('timelapse_videos')
          .update({
            processing_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', timelapseRecord.id)
      }
    }, 5000) // Simulate 5 second processing time

    // If early generation, apply point penalty
    if (isEarly) {
      try {
        // Get current progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_challenge_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .single()

        if (progressError) {
          console.error('Error fetching progress:', progressError)
        } else if (progressData) {
          // Apply 20% penalty
          const pointsPenalty = Math.floor(progressData.points_earned * 0.2)
          const newPoints = Math.max(0, progressData.points_earned - pointsPenalty)

          const { error: updateError } = await supabase
            .from('user_challenge_progress')
            .update({
              points_earned: newPoints,
              updated_at: new Date().toISOString()
            })
            .eq('id', progressData.id)

          if (updateError) {
            console.error('Error applying point penalty:', updateError)
          } else {
            console.log(`Applied point penalty: ${pointsPenalty} points deducted`)
            
            // Record the penalty transaction
            await supabase
              .from('points_transactions')
              .insert({
                user_id: userId,
                action_type: 'early_timelapse_penalty',
                points_amount: -pointsPenalty,
                source_id: challengeId,
                source_type: 'photo_challenge',
                metadata: {
                  challenge_id: challengeId,
                  timelapse_id: timelapseRecord.id,
                  reason: 'early_generation_penalty'
                }
              })
          }
        }
      } catch (penaltyError) {
        console.error('Error applying early generation penalty:', penaltyError)
        // Don't fail the whole operation for penalty errors
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timelapseId: timelapseRecord.id,
        status: 'processing',
        message: 'Time-lapse generation started. You will be notified when complete.',
        isEarly,
        photoCount: photos.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating time-lapse:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Time-lapse generation failed', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* 
Real Implementation Notes:

1. **Video Processing Libraries**:
   - Use FFmpeg WASM for browser-based processing
   - Or use server-side FFmpeg with Deno
   - Alternative: Use cloud video processing services

2. **Image Processing Flow**:
   ```typescript
   // Download images from Supabase storage
   const imageBlobs = await Promise.all(
     photos.map(photo => fetch(photo.image_url).then(r => r.blob()))
   )
   
   // Process with FFmpeg
   const ffmpeg = new FFmpeg()
   await ffmpeg.load()
   
   // Add images to FFmpeg
   for (let i = 0; i < imageBlobs.length; i++) {
     await ffmpeg.writeFile(`input${i}.jpg`, new Uint8Array(await imageBlobs[i].arrayBuffer()))
   }
   
   // Create video
   await ffmpeg.exec([
     '-framerate', '2', // 2 FPS
     '-i', 'input%d.jpg',
     '-c:v', 'libx264',
     '-pix_fmt', 'yuv420p',
     'output.mp4'
   ])
   
   // Get result
   const videoData = await ffmpeg.readFile('output.mp4')
   ```

3. **Storage Integration**:
   ```typescript
   // Upload video to Supabase storage
   const { data, error } = await supabase.storage
     .from('timelapse-videos')
     .upload(videoPath, videoBlob, {
       contentType: 'video/mp4'
     })
   ```

4. **Background Processing**:
   - Use Deno Deploy background tasks
   - Or implement webhook-based processing
   - Queue system for multiple requests

5. **Progress Updates**:
   - Use Supabase Realtime to notify users
   - Update processing_status field regularly
   - Send push notifications when complete
*/