package com.example.krushimitra.api;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface ApiService {
    @POST("signup")
    Call<ResponseMessage> signup(@Body User user);

    @POST("login")
    Call<ResponseMessage> login(@Body User user);
}
