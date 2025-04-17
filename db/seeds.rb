require 'faker'
require 'erb'
include ERB::Util

def round_to_nearest_hour(datetime)
  datetime += 30.minutes
  datetime.change(min: 0)
  datetime.change(sec: 0)
end


Booking.destroy_all
Slot.destroy_all
User.destroy_all

timezone = "America/New_York"

puts "Seeding 1 coach and 1 student..."

coach_name = "Coach Casey"
student_name = "Student Sam"

coach = User.create!(
  name: "Coach Casey",
  phone_number: Faker::PhoneNumber.cell_phone_in_e164,
  role: "coach",
  preferred_timezone: timezone,
  avatar_url: "https://avatar.iran.liara.run/public/boy?username=#{url_encode(coach_name)}"
)

student = User.create!(
  name: "Student Sam",
  phone_number: Faker::PhoneNumber.cell_phone_in_e164,
  role: "student",
  preferred_timezone: timezone,
  avatar_url: "https://avatar.iran.liara.run/public/boy?username=#{url_encode(student_name)}"
)

puts "Seeding 4 slots (2 past, 2 future)..."

slots = []

2.times do
  start_time = round_to_nearest_hour(Faker::Time.backward(days: 5, period: :morning))
  slots << Slot.create!(
    coach: coach,
    start_time: start_time,
    end_time: start_time + 2.hours
  )
end

2.times do
  start_time = round_to_nearest_hour(Faker::Time.forward(days: 5, period: :afternoon))
  slots << Slot.create!(
    coach: coach,
    start_time: start_time,
    end_time: start_time + 2.hours
  )
end

puts "Seeding 2 bookings (1 past, 1 future)..."

Booking.create!(
  slot: slots[0],  # past
  student: student,
  satisfaction_rating: 4,
  notes: "Great session, very helpful!"
)

Booking.create!(
  slot: slots[2],  # future
  student: student
)

puts "\nCoach Token:  #{coach.token}"
puts "Student Token: #{student.token}"
