Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  resources :users, only: [ :index, :show, :create, :update ]
  resources :slots, only: [ :show, :create, :update, :destroy ]
  resources :bookings, only: [ :show, :create, :update ]

  get "/coach_slots", to: "slots#coach_slots" # For coach to get upcoming slots
  get "/student_slots", to: "slots#student_slots" # For student to get upcoming, available slots or booked slots
end
