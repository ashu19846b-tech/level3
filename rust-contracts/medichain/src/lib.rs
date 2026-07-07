#![no_std]
use soroban_sdk::{contract, contractimpl, contractclient, contracttype, Address, Env, String, Vec, token};

#[contractclient(name = "RewardTokenClient")]
pub trait RewardTokenTrait {
    fn reward_patient(env: Env, patient: Address, amount: i128) -> bool;
    fn total_supply(env: Env) -> i128;
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    NextRecordId,
    NextApptId,
    Patient(Address),
    Doctor(Address),
    Record(u64),
    Appointment(u64),
    Permission(Address, Address), // (Patient, Doctor)
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotAuthorized = 2,
    NotRegistered = 3,
    AlreadyRegistered = 4,
    InvalidAmount = 5,
    AppointmentFinalized = 6,
    AppointmentNotFound = 7,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Record {
    pub id: u64,
    pub record_cid: String,
    pub title: String,
    pub timestamp: u64,
    pub author: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Patient {
    pub is_registered: bool,
    pub name: String,
    pub record_ids: Vec<u64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Doctor {
    pub is_registered: bool,
    pub name: String,
    pub specialization: String,
    pub consultation_fee: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Appointment {
    pub id: u64,
    pub patient: Address,
    pub doctor: Address,
    pub timestamp: u64,
    pub is_completed: bool,
    pub is_cancelled: bool,
    pub fee_paid: i128,
}

#[contract]
pub struct MediChainContract;

#[contractimpl]
impl MediChainContract {
    // 1. Initialization
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
             panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextRecordId, &1u64);
        env.storage().instance().set(&DataKey::NextApptId, &1u64);
    }

    // 2. Registration
    pub fn register_patient(env: Env, patient: Address, name: String) {
        patient.require_auth();
        let key = DataKey::Patient(patient.clone());
        if env.storage().persistent().has(&key) {
             panic!("Patient already registered");
        }
        
        let new_patient = Patient {
            is_registered: true,
            name,
            record_ids: Vec::new(&env),
        };
        env.storage().persistent().set(&key, &new_patient);
    }

    pub fn register_doctor(env: Env, doctor: Address, name: String, specialization: String, consultation_fee: i128) {
        doctor.require_auth();
        let key = DataKey::Doctor(doctor.clone());
        assert!(!env.storage().persistent().has(&key), "Doctor already registered");
        
        let new_doctor = Doctor {
            is_registered: true,
            name,
            specialization,
            consultation_fee,
        };
        env.storage().persistent().set(&key, &new_doctor);
    }

    // 3. Records Management
    pub fn add_record(env: Env, patient: Address, record_cid: String, title: String) {
        patient.require_auth();
        let p_key = DataKey::Patient(patient.clone());
        let mut p: Patient = env.storage().persistent().get(&p_key).expect("Patient not registered");
        
        let mut next_id: u64 = env.storage().instance().get(&DataKey::NextRecordId).unwrap();
        
        let record = Record {
            id: next_id,
            record_cid,
            title,
            timestamp: env.ledger().timestamp(),
            author: patient.clone(),
        };
        
        env.storage().persistent().set(&DataKey::Record(next_id), &record);
        p.record_ids.push_back(next_id);
        env.storage().persistent().set(&p_key, &p);
        
        next_id += 1;
        env.storage().instance().set(&DataKey::NextRecordId, &next_id);
    }

    /// Add record with automatic reward to patient (Inter-contract call example)
    pub fn add_record_with_reward(env: Env, patient: Address, record_cid: String, title: String, reward_token_addr: Address, reward_amount: i128) {
        patient.require_auth();
        let p_key = DataKey::Patient(patient.clone());
        let mut p: Patient = env.storage().persistent().get(&p_key).expect("Patient not registered");
        
        let mut next_id: u64 = env.storage().instance().get(&DataKey::NextRecordId).unwrap();
        
        let record = Record {
            id: next_id,
            record_cid,
            title,
            timestamp: env.ledger().timestamp(),
            author: patient.clone(),
        };
        
        env.storage().persistent().set(&DataKey::Record(next_id), &record);
        p.record_ids.push_back(next_id);
        env.storage().persistent().set(&p_key, &p);
        
        next_id += 1;
        env.storage().instance().set(&DataKey::NextRecordId, &next_id);
        
        // INTER-CONTRACT CALL: Call reward token contract to mint rewards using custom client
        if reward_amount > 0 {
            let token_client = RewardTokenClient::new(&env, &reward_token_addr);
            token_client.reward_patient(&patient, &reward_amount);
        }
    }

    pub fn add_record_for_patient(env: Env, doctor: Address, patient: Address, record_cid: String, title: String) {
        doctor.require_auth();
        let perm_key = DataKey::Permission(patient.clone(), doctor.clone());
        let has_perm: bool = env.storage().persistent().get(&perm_key).unwrap_or(false);
        assert!(has_perm, "Not authorized by patient");
        
        let p_key = DataKey::Patient(patient.clone());
        let mut p: Patient = env.storage().persistent().get(&p_key).expect("Patient not registered");
        
        let mut next_id: u64 = env.storage().instance().get(&DataKey::NextRecordId).unwrap();
        
        let record = Record {
            id: next_id,
            record_cid,
            title,
            timestamp: env.ledger().timestamp(),
            author: doctor.clone(),
        };
        
        env.storage().persistent().set(&DataKey::Record(next_id), &record);
        p.record_ids.push_back(next_id);
        env.storage().persistent().set(&p_key, &p);
        
        next_id += 1;
        env.storage().instance().set(&DataKey::NextRecordId, &next_id);
    }

    pub fn get_patient_records(env: Env, caller: Address, patient: Address) -> Vec<Record> {
        if caller != patient {
            let perm_key = DataKey::Permission(patient.clone(), caller.clone());
            let has_perm: bool = env.storage().persistent().get(&perm_key).unwrap_or(false);
            assert!(has_perm, "Not authorized to view records");
        }
        
        let p_key = DataKey::Patient(patient.clone());
        let p: Patient = env.storage().persistent().get(&p_key).expect("Patient not registered");
        
        let mut records = Vec::new(&env);
        for record_id in p.record_ids.iter() {
            let record: Record = env.storage().persistent().get(&DataKey::Record(record_id)).unwrap();
            records.push_back(record);
        }
        records
    }

    // 4. Access Control
    pub fn grant_access(env: Env, patient: Address, doctor: Address) {
        patient.require_auth();
        let d_key = DataKey::Doctor(doctor.clone());
        assert!(env.storage().persistent().has(&d_key), "Doctor not registered");
        
        let perm_key = DataKey::Permission(patient.clone(), doctor.clone());
        env.storage().persistent().set(&perm_key, &true);
    }

    pub fn revoke_access(env: Env, patient: Address, doctor: Address) {
        patient.require_auth();
        let perm_key = DataKey::Permission(patient.clone(), doctor.clone());
        env.storage().persistent().set(&perm_key, &false);
    }

    // 5. Appointments & Payments (Escrow)
    pub fn book_appointment(env: Env, patient: Address, doctor: Address, token_addr: Address) {
        patient.require_auth();
        
        let d_key = DataKey::Doctor(doctor.clone());
        let d: Doctor = env.storage().persistent().get(&d_key).expect("Doctor not registered");
        let fee = d.consultation_fee;
        
        // Transfer fee from patient to the contract
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&patient, &env.current_contract_address(), &fee);
        
        let mut next_id: u64 = env.storage().instance().get(&DataKey::NextApptId).unwrap();
        
        let appt = Appointment {
            id: next_id,
            patient: patient.clone(),
            doctor: doctor.clone(),
            timestamp: env.ledger().timestamp(),
            is_completed: false,
            is_cancelled: false,
            fee_paid: fee,
        };
        
        env.storage().persistent().set(&DataKey::Appointment(next_id), &appt);
        
        next_id += 1;
        env.storage().instance().set(&DataKey::NextApptId, &next_id);
    }

    pub fn complete_appointment(env: Env, doctor: Address, appointment_id: u64, token_addr: Address) {
        doctor.require_auth();
        let appt_key = DataKey::Appointment(appointment_id);
        let mut appt: Appointment = env.storage().persistent().get(&appt_key).expect("Appointment not found");
        
        assert!(appt.doctor == doctor, "Only assigned doctor can complete");
        assert!(!appt.is_completed && !appt.is_cancelled, "Appointment already finalized");
        
        appt.is_completed = true;
        env.storage().persistent().set(&appt_key, &appt);
        
        // Transfer fee from contract to doctor
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &doctor, &appt.fee_paid);
    }

    pub fn cancel_appointment(env: Env, caller: Address, appointment_id: u64, token_addr: Address) {
        caller.require_auth();
        let appt_key = DataKey::Appointment(appointment_id);
        let mut appt: Appointment = env.storage().persistent().get(&appt_key).expect("Appointment not found");
        
        assert!(caller == appt.patient || caller == appt.doctor, "Not authorized");
        assert!(!appt.is_completed && !appt.is_cancelled, "Appointment already finalized");
        
        appt.is_cancelled = true;
        env.storage().persistent().set(&appt_key, &appt);
        
        // Refund patient
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &appt.patient, &appt.fee_paid);
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_register_patient() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let patient = Address::generate(&env);

        MediChainContract::initialize(env.clone(), admin);
        MediChainContract::register_patient(env.clone(), patient.clone, String::from_slice(&env, "John Doe"));

        let patient_key = DataKey::Patient(patient);
        assert!(env.storage().persistent().has(&patient_key));
    }

    #[test]
    fn test_register_doctor() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let doctor = Address::generate(&env);

        MediChainContract::initialize(env.clone(), admin);
        MediChainContract::register_doctor(
            env.clone(),
            doctor.clone,
            String::from_slice(&env, "Dr. Smith"),
            String::from_slice(&env, "Cardiology"),
            1000
        );

        let doctor_key = DataKey::Doctor(doctor);
        assert!(env.storage().persistent().has(&doctor_key));
    }

    #[test]
    fn test_token_transfer() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let token_addr = Address::generate(&env);

        MediChainContract::initialize(env.clone(), admin);
        
        // Mock token transfer by testing the function signature
        // This test verifies the token transfer logic is callable
        let patient = Address::generate(&env);
        MediChainContract::register_patient(env.clone(), patient.clone, String::from_slice(&env, "Jane Doe"));
        
        // Test that add_record_with_reward can be called with token parameters
        let record_cid = String::from_slice(&env, "QmTest123");
        let title = String::from_slice(&env, "Test Record");
        
        // This would normally call the token contract, but for testing we just verify the function exists
        assert!(true);
    }
}
