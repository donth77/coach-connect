class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :phone_number, null: false
      t.string :role, null: false
      t.string :preferred_timezone
      t.string :token

      t.timestamps
    end

    add_check_constraint :users, "role IN ('coach', 'student')", name: "users_role_check"
    add_index :users, :token, unique: true
  end
end
