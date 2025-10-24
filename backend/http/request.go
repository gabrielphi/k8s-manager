package http

import (
	"fmt"
	"log"
	"net/http"
)

func Listen() {
	// Define a handler function for the "/hello" endpoint
	http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		// Log the incoming request details
		log.Printf("Received request for %s from %s", r.URL.Path, r.RemoteAddr)

		// Respond to the client
		fmt.Fprintf(w, "Hello, Go API Listener!")
	})

	// Start the HTTP server and listen on port 8080
	fmt.Println("API listener starting on port 7000...")
	log.Fatal(http.ListenAndServe(":7000", nil))
}
