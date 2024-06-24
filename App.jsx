import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import StudentCredentialContract from './artifacts/StudentCredential.json';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [studentAddress, setStudentAddress] = useState('');
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [parentAddress, setParentAddress] = useState('');
  const [grade, setGrade] = useState('');
  const [verificationResult, setVerificationResult] = useState('');
  const [gradeResult, setGradeResult] = useState('');

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          setWeb3(web3Instance);
          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = StudentCredentialContract.networks[networkId];
          if (deployedNetwork) {
            const instance = new web3Instance.eth.Contract(
              StudentCredentialContract.abi,
              deployedNetwork.address,
            );
            setContract(instance);
          } else {
            console.error('Smart contract not deployed to the detected network.');
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    init();
  }, []);

  const addStudent = async () => {
    if (contract) {
      try {
        await contract.methods.addStudent(studentAddress, name, studentId, parentAddress).send({ from: accounts[0] });
        console.log('Student added successfully');
      } catch (error) {
        console.error('Error adding student:', error);
      }
    }
  };
  
  const verifyStudent = async () => {
    try {
      if (contract) {
        await contract.methods.verifyStudent(studentAddress).send({ from: accounts[0] });
        const student = await contract.methods.getStudent(studentAddress).call();
        const result = student.isVerified ? 'Student is verified' : 'Student is not verified';
        setVerificationResult(result);
        console.log('Verification result:', result);
      }
    } catch (error) {
      console.error('Error verifying student:', error);
    }
  };   

  const addGrade = async () => {
    if (contract) {
      await contract.methods.addGrade(studentAddress, grade).send({ from: accounts[0] });
    }
  };

  const getGrade = async () => {
    if (contract) {
      const grade = await contract.methods.getGrade(studentAddress).call({ from: accounts[0] });
      setGradeResult(grade);
    }
  };

  return (
    <div className="app">
      <h1>Student Credential Verification</h1>
      <input
        type="text"
        placeholder="Student Address"
        value={studentAddress}
        onChange={(e) => setStudentAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Parent Address"
        value={parentAddress}
        onChange={(e) => setParentAddress(e.target.value)}
      />
      <button onClick={addStudent}>Add Student</button>
      <button onClick={verifyStudent}>Verify Student</button>
      <p>{verificationResult}</p>
      <input
        type="text"
        placeholder="Grade"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
      />
      <button onClick={addGrade}>Add Grade</button>
      <button onClick={getGrade}>Get Grade</button>
      <p>Grade: {gradeResult}</p>
    </div>
  );
}

export default App;
