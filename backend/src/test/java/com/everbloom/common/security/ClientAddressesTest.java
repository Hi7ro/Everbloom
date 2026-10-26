package com.everbloom.common.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class ClientAddressesTest {
    @Test void ignoresAllForwardedHeadersByDefault() {
        var request = request("198.51.100.7", "127.0.0.1"); request.addHeader("X-Forwarded-For", "127.0.0.1");
        assertThat(new ClientAddresses("").client(request)).isEqualTo("198.51.100.7");
    }
    @Test void onlyExactTrustedPeerCanSupplyValidatedRealIp() {
        var resolver = new ClientAddresses("10.0.0.2, ::1");
        assertThat(resolver.client(request("10.0.0.2", "198.51.100.8"))).isEqualTo("198.51.100.8");
        assertThat(resolver.client(request("10.0.0.3", "198.51.100.8"))).isEqualTo("10.0.0.3");
        assertThat(resolver.client(request("10.0.0.2", "evil.example"))).isEqualTo("10.0.0.2");
        assertThat(resolver.client(request("10.0.0.2", "1.2.3.999"))).isEqualTo("10.0.0.2");
        assertThat(resolver.client(request("10.0.0.2", "198.51.100.8,127.0.0.1"))).isEqualTo("10.0.0.2");
    }
    @Test void trustedListCannotContainDnsNamesOrBroadRanges() {
        assertThatThrownBy(() -> new ClientAddresses("proxy.local")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new ClientAddresses("10.0.0.0/8")).isInstanceOf(IllegalStateException.class);
    }
    private MockHttpServletRequest request(String peer, String real) {
        var request = new MockHttpServletRequest(); request.setRemoteAddr(peer); request.addHeader("X-Real-IP", real); return request;
    }
}
