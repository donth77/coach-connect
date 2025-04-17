require 'faker'
require 'erb'
include ERB::Util

def round_to_nearest_hour(datetime)
  datetime += 15.minutes
  datetime.change(min: (datetime.min / 30) * 30, sec: 0)
end

Booking.destroy_all
Slot.destroy_all
User.destroy_all

TIMEZONES = [
  "America/New_York", "America/Los_Angeles", "Europe/London",
  "Asia/Tokyo", "Australia/Sydney", "Europe/Berlin"
]

COACH_NOTES = [
  "The student showed great progress today.",
  "We focused on improving problem-solving skills.",
  "The session went well, but more practice is needed.",
  "The student asked insightful questions and was very engaged.",
  "We reviewed the previous session's material and made improvements.",
  "The student needs to work on time management for assignments.",
  "Great session! The student is improving steadily.",
  "We discussed strategies for tackling complex problems.",
  "The student demonstrated excellent understanding of the topic.",
  "We identified areas for improvement and set goals for the next session."
]

$existing_slots = []

coach1_name = "Coach Casey"
student1_name = "Student Sam"

coach1 = User.create!(
  name: coach1_name,
  phone_number: Faker::PhoneNumber.cell_phone_in_e164,
  role: "coach",
  preferred_timezone: TIMEZONES[0],
  avatar_url: "https://avatar.iran.liara.run/public/boy?username=#{url_encode(coach1_name)}"
)

student1 = User.create!(
  name: student1_name,
  phone_number: Faker::PhoneNumber.cell_phone_in_e164,
  role: "student",
  preferred_timezone: TIMEZONES[0],
  avatar_url: "https://avatar.iran.liara.run/public/boy?username=#{url_encode(student1_name)}"
)

coach2_gender = [ "M", "F" ].sample
coach3_gender = [ "M", "F" ].sample
student2_gender = [ "M", "F" ].sample
student3_gender = [ "M", "F" ].sample

coach2_name = coach2_gender == "M" ? Faker::Name.male_first_name : Faker::Name.female_first_name
coach3_name = coach3_gender == "M" ? Faker::Name.male_first_name : Faker::Name.female_first_name
student2_name = student2_gender == "M" ? Faker::Name.male_first_name : Faker::Name.female_first_name
student3_name = student3_gender == "M" ? Faker::Name.male_first_name : Faker::Name.female_first_name

coach2 = User.create!(
  name: "Coach #{coach2_name}",
  phone_number: Faker::PhoneNumber.cell_phone_in_e164,
  role: "coach",
  preferred_timezone: TIMEZONES.sample,
  avatar_url: "https://avatar.iran.liara.run/public/#{coach2_gender == 'M' ? 'boy' : 'girl'}?username=#{url_encode(coach2_name)}"
)

coach3 = User.create!(
  name: "Coach #{coach3_name}",
  phone_number: Faker::PhoneNumber.cell_phone_in_e164,
  role: "coach",
  preferred_timezone: TIMEZONES.sample,
  avatar_url: "https://avatar.iran.liara.run/public/#{coach3_gender == 'M' ? 'boy' : 'girl'}?username=#{url_encode(coach3_name)}"
)

student2 = User.create!(
  name: "Student #{student2_name}",
  phone_number: Faker::PhoneNumber.cell_phone_in_e164,
  role: "student",
  preferred_timezone: TIMEZONES.sample,
  avatar_url: "https://avatar.iran.liara.run/public/#{student2_gender == 'M' ? 'boy' : 'girl'}?username=#{url_encode(student2_name)}"
)

student3 = User.create!(
  name: "Student #{student3_name}",
  phone_number: Faker::PhoneNumber.cell_phone_in_e164,
  role: "student",
  preferred_timezone: TIMEZONES.sample,
  avatar_url: "https://avatar.iran.liara.run/public/#{student3_gender == 'M' ? 'boy' : 'girl'}?username=#{url_encode(student3_name)}"
)


def slot_overlaps?(start_time, end_time)
  $existing_slots.any? do |slot|
    (start_time < slot[:end_time] && end_time > slot[:start_time])
  end
end

def weekday?(datetime)
  !datetime.saturday? && !datetime.sunday?
end

def create_slots_and_bookings(coach, student)
  slots = []

  2.times do
    loop do
      start_time = round_to_nearest_hour(Faker::Time.backward(days: 5, period: :morning))
      end_time = start_time + 2.hours

      if weekday?(start_time) && !slot_overlaps?(start_time, end_time)
        slots << Slot.create!(
          coach: coach,
          start_time: start_time,
          end_time: end_time
        )
        $existing_slots << { start_time: start_time, end_time: end_time }
        break
      end
    end
  end

  2.times do
    loop do
      start_time = round_to_nearest_hour(Faker::Time.forward(days: 5, period: :afternoon))
      end_time = start_time + 2.hours

      if weekday?(start_time) && !slot_overlaps?(start_time, end_time)
        slots << Slot.create!(
          coach: coach,
          start_time: start_time,
          end_time: end_time
        )
        $existing_slots << { start_time: start_time, end_time: end_time }
        break
      end
    end
  end

  4.times do |i|
    loop do
      start_time = round_to_nearest_hour(Faker::Time.forward(days: 7 + i, period: :morning))
      end_time = start_time + 2.hours

      if weekday?(start_time) && !slot_overlaps?(start_time, end_time)
        Slot.create!(
          coach: coach,
          start_time: start_time,
          end_time: end_time
        )
        $existing_slots << { start_time: start_time, end_time: end_time }
        break
      end
    end
  end

  Booking.create!(
    slot: slots[0],
    student: student,
    satisfaction_rating: rand(3..5),
    notes: COACH_NOTES.sample
  )

  Booking.create!(
    slot: slots[2],
    student: student
  )
end

def create_additional_past_sessions(coaches, students)
  coaches.each_with_index do |coach, index|
    student1 = students[index % students.length]
    student2 = students[(index + 1) % students.length]

    2.times do
      loop do
        start_time = round_to_nearest_hour(Faker::Time.backward(days: 10, period: :morning))
        end_time = start_time + 2.hours

        if !start_time.saturday? && !start_time.sunday? && !slot_overlaps?(start_time, end_time)
          slot = Slot.create!(
            coach: coach,
            start_time: start_time,
            end_time: end_time
          )

          $existing_slots << { start_time: start_time, end_time: end_time }

          Booking.create!(
            slot: slot,
            student: [ student1, student2 ].sample,
            satisfaction_rating: rand(3..5),
            notes: COACH_NOTES.sample
          )

          break
        end
      end
    end
  end
end


create_slots_and_bookings(coach1, student1)
create_slots_and_bookings(coach2, student2)
create_slots_and_bookings(coach3, student3)

coaches = [ coach1, coach2, coach3 ]
students = [ student1, student2, student3 ]

create_additional_past_sessions(coaches, students)
