package com.everbloom.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;

/** Bounds JSON allocation, including requests using chunked transfer without Content-Length. */
public final class AuthBodyLimitFilter extends OncePerRequestFilter {
    private static final int MAX_BYTES = 16 * 1024;
    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !"POST".equals(request.getMethod()) || !(path.startsWith("/api/auth/") || path.startsWith("/api/account/") || path.equals("/api/billing/refresh"));
    }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        byte[] body = request.getInputStream().readNBytes(MAX_BYTES + 1);
        if (body.length > MAX_BYTES) {
            response.setStatus(413); response.setContentType("application/json");
            response.getWriter().write("{\"code\":\"REQUEST_TOO_LARGE\",\"message\":\"Die Anfrage ist zu groß.\"}"); return;
        }
        chain.doFilter(new HttpServletRequestWrapper(request) {
            @Override public ServletInputStream getInputStream() {
                var input = new ByteArrayInputStream(body);
                return new ServletInputStream() {
                    @Override public int read() { return input.read(); }
                    @Override public int read(byte[] target, int offset, int length) { return input.read(target, offset, length); }
                    @Override public boolean isFinished() { return input.available() == 0; }
                    @Override public boolean isReady() { return true; }
                    @Override public void setReadListener(ReadListener listener) { throw new UnsupportedOperationException("Synchronous JSON requests only"); }
                };
            }
        }, response);
    }
}
