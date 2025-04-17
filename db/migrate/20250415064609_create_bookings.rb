class CreateBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings do |t|
      # Add a unique index here to enforce one booking per slot
      t.references :slot, null: false, foreign_key: true, index: { unique: true }

      # Reference to the 'users' table instead of a 'students' table
      t.references :student, null: false, foreign_key: { to_table: :users }

      # Make sure the check constraint allows NULL
      t.integer :satisfaction_rating
      t.text :notes

      t.timestamps
    end

    # Check constraint that also allows NULL
    add_check_constraint :bookings,
                         "(satisfaction_rating BETWEEN 1 AND 5) OR (satisfaction_rating IS NULL)",
                         name: "bookings_satisfaction_rating_check"
  end
end
