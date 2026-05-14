package com.hostel.smarthostelbackend.config;

import com.hostel.smarthostelbackend.security.JwtAuthenticationEntryPoint;
import com.hostel.smarthostelbackend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtAuthenticationEntryPoint authenticationEntryPoint) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())

                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())

                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))

                .authorizeHttpRequests(auth -> auth

                        // ── Preflight ──
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── Public endpoints ──
                        .requestMatchers("/", "/error").permitAll()
                        .requestMatchers("/api/health/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/matching/ai-health").permitAll()

                        // ══════════════════════════════════════════
                        //  ADMIN-ONLY ENDPOINTS
                        //  JwtAuthenticationFilter sets: ROLE_ADMIN
                        //  hasRole("ADMIN") checks for ROLE_ADMIN ✅
                        // ══════════════════════════════════════════

                        // Student admin
                        .requestMatchers("/api/students/admin/**").hasRole("ADMIN")

                        // Payment admin
                        .requestMatchers("/api/payments/admin/**").hasRole("ADMIN")

                        // Complaint admin
                        .requestMatchers("/api/complaints/admin/**").hasRole("ADMIN")

                        // Canteen admin
                        .requestMatchers("/api/canteen/admin/**").hasRole("ADMIN")

                        // Notification admin
                        .requestMatchers("/api/notifications/admin/**").hasRole("ADMIN")

                        // Energy admin
                        .requestMatchers("/api/energy/admin/**").hasRole("ADMIN")

                        // Dashboard admin
                        .requestMatchers("/api/dashboard/admin/**").hasRole("ADMIN")

                        // ══════════════════════════════════════════
                        //  AUTHENTICATED (any logged-in user)
                        // ══════════════════════════════════════════

                        // Student self-service
                        .requestMatchers("/api/students/me").authenticated()

                        // Payments (student can access own)
                        .requestMatchers("/api/payments/**").authenticated()

                        // Complaints (student can submit/view own)
                        .requestMatchers("/api/complaints/**").authenticated()

                        // Canteen (student can order/view menu)
                        .requestMatchers("/api/canteen/**").authenticated()

                        // Notifications (student can view own)
                        .requestMatchers("/api/notifications/my/**").authenticated()

                        // AI Matching
                        .requestMatchers("/api/matching/**").authenticated()

                        // Survey
                        .requestMatchers("/api/survey/**").authenticated()

                        // Roommate requests
                        .requestMatchers("/api/roommate-requests/**").authenticated()

                        // Rooms
                        .requestMatchers("/api/rooms/**").authenticated()

                        // ── Everything else ──
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}