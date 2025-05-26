-- US 3.1: Seed data for measurement guides
-- This script inserts sample measurement guide content into the measurement_guides_content table

-- Insert measurement guides for all standard measurements
INSERT INTO measurement_guides_content (measurement_key, title, description, image_url) VALUES
(
  'chest_circumference',
  'Chest/Bust Circumference',
  'To measure your chest/bust circumference:

1. Stand straight with your arms relaxed at your sides
2. Wrap the measuring tape around the fullest part of your chest/bust
3. Keep the tape parallel to the floor
4. The tape should be snug but not tight - you should be able to breathe comfortably
5. Take the measurement at the end of a normal exhale

For women: Measure over a well-fitting, non-padded bra
For men: Measure directly over the skin or a thin shirt

This measurement is crucial for determining the fit of tops, sweaters, and dresses.',
  '/images/guides/chest_circumference.svg'
),
(
  'waist_circumference',
  'Waist Circumference',
  'To measure your waist circumference:

1. Stand straight and breathe normally
2. Locate your natural waistline - this is typically the narrowest part of your torso, usually just above your belly button
3. Wrap the measuring tape around your waist at this natural waistline
4. Keep the tape parallel to the floor
5. The tape should be snug but not tight - don''t suck in your stomach
6. Take the measurement at the end of a normal exhale

Tips:
- If you can''t find your natural waist, bend to one side - the crease that forms is your natural waistline
- For garments, this measurement helps determine the fit at the waist area',
  '/images/guides/waist_circumference.svg'
),
(
  'hip_circumference',
  'Hip Circumference',
  'To measure your hip circumference:

1. Stand straight with your feet together
2. Locate the fullest part of your hips and buttocks
3. Wrap the measuring tape around this fullest part
4. Keep the tape parallel to the floor
5. The tape should be snug but not tight
6. Make sure the tape doesn''t slip up or down

Tips:
- This is usually about 7-9 inches (18-23 cm) below your natural waistline
- Look in a mirror to ensure the tape is level all around
- This measurement is important for the fit of skirts, pants, and dresses',
  '/images/guides/hip_circumference.svg'
),
(
  'shoulder_width',
  'Shoulder Width',
  'To measure your shoulder width:

1. Stand straight with your arms relaxed at your sides
2. Have someone help you with this measurement for accuracy
3. Measure from the edge of one shoulder (where the shoulder meets the arm) to the edge of the other shoulder
4. The measurement should go across your back, following the natural line of your shoulders
5. Keep the tape straight and parallel to the floor

Tips:
- This is measured across the back, not the front
- The measurement points are where your shoulder "drops off" to your arm
- This measurement is crucial for proper fit of tops, jackets, and sweaters',
  '/images/guides/shoulder_width.svg'
),
(
  'arm_length',
  'Arm Length',
  'To measure your arm length:

1. Stand straight with your arm slightly bent at your side
2. Start measuring from the shoulder point (where your shoulder meets your arm)
3. Measure down the outside of your arm to your wrist bone
4. Keep your arm slightly bent in a natural position
5. The tape should follow the natural curve of your arm

Tips:
- Don''t measure with your arm completely straight - keep it slightly bent
- This measurement is used for sleeve length in garments
- For more precise sleeve fitting, you may also want to measure from shoulder to elbow separately',
  '/images/guides/arm_length.svg'
),
(
  'inseam_length',
  'Inseam Length',
  'To measure your inseam length:

1. Stand straight against a wall with your feet slightly apart
2. Place the measuring tape at your crotch (where the seams of your pants would meet)
3. Measure straight down to your ankle bone
4. Keep the tape straight and close to your leg
5. For best results, wear fitted pants and measure along the inner seam

Tips:
- This measurement determines the length of pants and leggings
- Measure to where you want your pants to end (ankle, floor, etc.)
- It''s helpful to have someone assist with this measurement for accuracy',
  '/images/guides/inseam_length.svg'
),
(
  'torso_length',
  'Torso Length',
  'To measure your torso length:

1. Stand straight with your head in a natural position
2. Start measuring from the base of your neck (where your neck meets your shoulders at the back)
3. Measure straight down your spine to your natural waistline
4. Keep the tape close to your body and straight

Tips:
- This measurement helps determine the length of tops and the placement of waistlines
- The natural waistline is typically the narrowest part of your torso
- This measurement is useful for determining if you have a long or short torso',
  '/images/guides/torso_length.svg'
),
(
  'head_circumference',
  'Head Circumference',
  'To measure your head circumference:

1. Position the measuring tape around the largest part of your head
2. The tape should sit about 1 inch (2.5 cm) above your eyebrows
3. Wrap the tape around the back of your head at the same level
4. The tape should be snug but comfortable
5. Make sure the tape is level all around your head

Tips:
- This measurement is essential for hat sizing
- Don''t pull the tape too tight - it should be comfortable
- Measure over your hair in its natural state',
  '/images/guides/head_circumference.svg'
),
(
  'neck_circumference',
  'Neck Circumference',
  'To measure your neck circumference:

1. Stand straight and look forward
2. Wrap the measuring tape around the base of your neck
3. The tape should sit where a shirt collar would naturally fall
4. Keep the tape snug but comfortable - you should be able to breathe easily
5. Make sure the tape is level all around

Tips:
- This measurement is used for collar sizing in shirts and sweaters
- Don''t pull the tape too tight - add about 1/2 inch (1.3 cm) for comfort
- Keep your head in a natural position while measuring',
  '/images/guides/neck_circumference.svg'
),
(
  'wrist_circumference',
  'Wrist Circumference',
  'To measure your wrist circumference:

1. Wrap the measuring tape around your wrist just below the wrist bone
2. The tape should be snug but not tight
3. Make sure you can slide the tape around easily
4. Measure your dominant hand (the hand you write with)

Tips:
- This measurement is used for bracelet and watch sizing
- Also useful for determining cuff size in sleeves
- The measurement should be taken at the narrowest part of your wrist',
  '/images/guides/wrist_circumference.svg'
),
(
  'ankle_circumference',
  'Ankle Circumference',
  'To measure your ankle circumference:

1. Sit down and place your foot flat on the floor
2. Wrap the measuring tape around the narrowest part of your ankle
3. This is usually just above the ankle bone
4. The tape should be snug but not tight
5. Make sure the tape is level all around

Tips:
- This measurement is useful for sock and boot fitting
- Also used for ankle cuffs in pants and leggings
- Measure both ankles if there''s a significant difference',
  '/images/guides/ankle_circumference.svg'
),
(
  'foot_length',
  'Foot Length',
  'To measure your foot length:

1. Stand on a piece of paper with your heel against a wall
2. Mark the longest point of your foot on the paper
3. Measure from the wall to the mark
4. Repeat for both feet and use the larger measurement
5. Measure in the evening when your feet are at their largest

Tips:
- This measurement is essential for shoe sizing
- Also useful for sock and slipper patterns
- Always measure both feet as they can be different sizes
- Wear the type of socks you''ll typically wear with the shoes',
  '/images/guides/foot_length.svg'
);

-- Update the updated_at timestamp for all inserted records
UPDATE measurement_guides_content SET updated_at = NOW(); 