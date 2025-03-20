package com.example.app;


import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private EditText etPhoneNumber, etPassword;
    private Button btnSubmit;

    private static final String LOGIN_URL = "http://192.168.1.5:3000/login";
    private static final String REGISTER_URL = "http://192.168.1.5:3000/register";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etPhoneNumber = findViewById(R.id.etPhoneNumber);
        etPassword = findViewById(R.id.etPassword);
        btnSubmit = findViewById(R.id.btnSubmit);

        btnSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String phoneNumber = etPhoneNumber.getText().toString().trim();
                String password = etPassword.getText().toString().trim();

                if (phoneNumber.isEmpty() || password.isEmpty()) {
                    Toast.makeText(MainActivity.this, "Please fill in both fields", Toast.LENGTH_SHORT).show();
                    return;
                }

                // Create JSON object
                JSONObject loginData = new JSONObject();
                try {
                    loginData.put("phone", phoneNumber);
                    loginData.put("password", password);
                } catch (JSONException e) {
                    e.printStackTrace();
                }

                // Send login request
                sendLoginRequest(loginData);
            }
        });
    }

    private void sendLoginRequest(JSONObject loginData) {
        JsonObjectRequest loginRequest = new JsonObjectRequest(
                Request.Method.POST,
                LOGIN_URL,
                loginData,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        // Handle successful login response
                        Toast.makeText(MainActivity.this, "Login successful", Toast.LENGTH_SHORT).show();
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        if (error.networkResponse != null) {
                            int statusCode = error.networkResponse.statusCode;
                            String errorResponse = new String(error.networkResponse.data);

                            // Log the response for better debugging
                            Log.e("VolleyError", "Status Code: " + statusCode);
                            Log.e("VolleyError", "Response Data: " + errorResponse);

                            // Handling different status codes
                            if (statusCode == 401) {
                                // Incorrect password
                                Toast.makeText(MainActivity.this, "Incorrect password", Toast.LENGTH_SHORT).show();
                            } else if (statusCode == 404) {
                                // User not found, attempt to register
                                sendRegisterRequest(loginData);
                            } else {
                                // Generic error handling
                                Toast.makeText(MainActivity.this, "An error occurred: " + errorResponse, Toast.LENGTH_LONG).show();
                            }
                        } else {
                            // Network error or no response, log the error and show a message
                            Log.e("VolleyError", "Error: " + error.toString());
                            Toast.makeText(MainActivity.this, "Network error or no response from server", Toast.LENGTH_LONG).show();
                        }
                    }
                });

        // Add request to the Volley request queue
        Volley.newRequestQueue(this).add(loginRequest);
    }

    private void sendRegisterRequest(JSONObject loginData) {
        JsonObjectRequest registerRequest = new JsonObjectRequest(
                Request.Method.POST,
                REGISTER_URL,
                loginData,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        // Handle successful register response
                        Toast.makeText(MainActivity.this, "Registration successful", Toast.LENGTH_SHORT).show();
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        // Handle registration failure
                        Toast.makeText(MainActivity.this, "Registration failed", Toast.LENGTH_SHORT).show();
                    }
                });

        // Add request to the Volley request queue
        Volley.newRequestQueue(this).add(registerRequest);
    }
}
