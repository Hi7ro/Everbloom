package com.everbloom.common.security;

import jakarta.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Proxy headers are ignored unless the direct peer is explicitly trusted; no DNS resolution. */
@Component
public class ClientAddresses {
    private final Set<String> trusted;
    public ClientAddresses(@Value("${app.security.trusted-proxy-ips:}") String proxies) {
        trusted = Arrays.stream(proxies.split(",")).map(String::trim).filter(value -> !value.isEmpty()).map(value -> {
            String address = literal(value);
            if (address == null) throw new IllegalStateException("Trusted proxies must be explicit IP literals.");
            return address;
        }).collect(Collectors.toUnmodifiableSet());
    }
    public String client(HttpServletRequest request) {
        String remote = request.getRemoteAddr();
        String direct = literal(remote);
        if (direct != null && trusted.contains(direct)) {
            String forwarded = literal(request.getHeader("X-Real-IP"));
            if (forwarded != null) return forwarded;
        }
        return remote;
    }
    private static String literal(String value) {
        if (value == null || value.length() > 64) return null;
        if (value.contains(":")) {
            if (!value.matches("[0-9a-fA-F:.]+")) return null;
        } else {
            if (!value.matches("[0-9]{1,3}(\\.[0-9]{1,3}){3}")) return null;
            for (String octet : value.split("\\.")) if (Integer.parseInt(octet) > 255) return null;
        }
        try { return InetAddress.getByName(value).getHostAddress(); }
        catch (UnknownHostException invalid) { return null; }
    }
}
