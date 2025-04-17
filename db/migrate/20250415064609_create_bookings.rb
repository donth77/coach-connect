class CreateBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings do |t|
      t.references :slot, null: false, foreign_key: true, index: { unique: true }
      t.references :student, null: false, foreign_key: { to_table: :users }

      t.integer :satisfaction_rating
      t.text :notes

      t.timestamps
    end

    add_check_constraint :bookings,
                         "(satisfaction_rating BETWEEN 1 AND 5) OR (satisfaction_rating IS NULL)",
                         name: "bookings_satisfaction_rating_check"
  end
end
