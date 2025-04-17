class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :name
      t.string :email
      t.string :phone_number
      t.string :role
      t.string :token
      t.string :avatar_url
      t.string :preferred_timezone
      t.timestamps
    end

    add_check_constraint :users, "role IN ('coach', 'student')", name: "users_role_check"
    add_index :users, :token, unique: true
  end
end
