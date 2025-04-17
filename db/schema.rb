# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_04_15_064609) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "bookings", force: :cascade do |t|
    t.bigint "slot_id", null: false
    t.bigint "student_id", null: false
    t.integer "satisfaction_rating"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slot_id"], name: "index_bookings_on_slot_id", unique: true
    t.index ["student_id"], name: "index_bookings_on_student_id"
    t.check_constraint "satisfaction_rating >= 1 AND satisfaction_rating <= 5 OR satisfaction_rating IS NULL", name: "bookings_satisfaction_rating_check"
  end

  create_table "slots", force: :cascade do |t|
    t.bigint "coach_id", null: false
    t.datetime "start_time", null: false
    t.datetime "end_time", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["coach_id"], name: "index_slots_on_coach_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone_number"
    t.string "role"
    t.string "token"
    t.string "avatar_url"
    t.string "preferred_timezone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_users_on_token", unique: true
    t.check_constraint "role::text = ANY (ARRAY['coach'::character varying, 'student'::character varying]::text[])", name: "users_role_check"
  end

  add_foreign_key "bookings", "slots"
  add_foreign_key "bookings", "users", column: "student_id"
  add_foreign_key "slots", "users", column: "coach_id"
end
