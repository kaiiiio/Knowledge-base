# Basic Client-Server Architecture — Notes (from L2_Client_Server.pdf)

Source: TechByAni HLD-Notes.

## What happens when you type abc.com in your browser?

```
User → Client (App/Browser) —request→ Server
                             ←response—
```

## IP addresses

**IP address (Internet Protocol address)** — the numeric identifier of a device on a network.

**IPv4**: four numbers separated by dots (e.g. `192.168.1.1`). Each number (octet) ranges 0–255. 32-bit, ~4.3 billion total possible addresses. `192.168.1.10` = 4 octets (A.B.C.D).

**IPv6**: eight groups of hexadecimal numbers separated by colons (e.g. `2001:0db8:85a3:0000:0000:8a2e:0370:7334`). 128-bit, ~340 undecillion total addresses. **Why IPv6?** IPv4 addresses are running out due to the growing number of devices; IPv6 solves this with a much larger address space.

**Categories of IP address**: Public vs Private.

## Public vs private IP, and NAT

```
Internet
   ↑ public IP
Router (uses NAT)
   ↓ private IP
Laptop, Phone, TV
```
The router has one public IP visible to the internet; devices behind it (laptop, phone, TV) each get a private IP. **NAT (Network Address Translation)** on the router maps outgoing traffic from private IPs to the single public IP, and routes responses back to the right device.

## DNS resolution + request/response

```
                DNS
                 ↕  (abc.com ↔ IP address)
User → Client (App/Browser) —request→ Server
                             ←response—
```
The browser asks DNS to resolve `abc.com` into an IP address, then sends the actual request to that IP.

## OSI Model — 7 layers (as referenced)

- **Transport Layer** → TCP / UDP
- **Application Layer** → HTTP/HTTPS, WebSockets, WebRTC

## TCP (Transmission Control Protocol)

```
Client                              Server
  —SYN——————————————————————————→
  ←—————————SYN-ACK———————————————
  —ACK——————————————————————————→     (Connection Established — Data Transfer Begins)
  ... data transfer ...
  —FIN——————————————————————————→
  ←—————————ACK————————————————————
  ←—————————FIN————————————————————
  —ACK——————————————————————————→     (Connection Ends)
```

**Key features of TCP**:
- **Connection-oriented** — establishes a connection (3-way handshake) before data transfer.
- **Reliable** — guarantees delivery by retransmitting lost packets.
- **Ordered** — data packets arrive in the correct sequence.
- **Error checking** — detects errors and corrects them.
- **Flow control** — manages data rate to avoid overwhelming the receiver.
- **Congestion control** — adjusts the sending rate to avoid network congestion.

## UDP (User Datagram Protocol)

**Type**: Connectionless. **No ordering**, some data loss acceptable. **Purpose**: fast transmission without guaranteed delivery. **Use case**: when speed matters more than reliability. **Examples**: live streaming, online gaming.
