# System Context – Janta Pharmacy

## Purpose

This document describes the high-level system context for Janta Pharmacy.
It shows the main actors, external systems, and how they interact with
the core platform.

The goal is clarity, not implementation detail.

## Actors

### Customer
- Browses medicines
- Uploads prescriptions
- Places and tracks orders

### Pharmacy Admin
- Manages inventory and catalog
- Reviews prescriptions
- Processes orders

### Delivery Partner (Future)
- Receives delivery assignments
- Updates delivery status

## Core System

### Janta Pharmacy Platform

A single backend system that:
- Exposes APIs to client applications
- Enforces business rules
- Manages data persistence
- Coordinates workflows across modules

## External Systems

### Payment Gateway (Future)
- Handles payment processing
- Returns payment status

### Notification Services (Future)
- Sends SMS and email notifications

### Delivery Service (Future)
- Handles last-mile delivery coordination

## High-Level Interactions

- Customers interact with the platform via web or mobile clients
- Admins use a secured admin interface
- The platform communicates with external systems through APIs
- All business rules and validations reside within the core platform

## System Context Diagram

The diagram below shows the high-level context of Janta Pharmacy,
including users, the core platform, and external systems.

```mermaid
flowchart LR
    Customer[Customer]
    Admin[Pharmacy Admin]
    Delivery[Delivery Partner]
    
    WebApp[Web Application]
    MobileApp[Mobile Application]
    
    Core[Janta Pharmacy Platform]
    
    Payment[Payment Gateway]
    Notification[Notification Service]
    DeliverySvc[Delivery Service]

    Customer --> WebApp
    Customer --> MobileApp

    Admin --> WebApp

    WebApp --> Core
    MobileApp --> Core

    Core --> Payment
    Core --> Notification
    Core --> DeliverySvc

    Delivery --> DeliverySvc
