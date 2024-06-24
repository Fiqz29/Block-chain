// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract StudentCredential {
    struct Student {
        string name;
        string studentId;
        bool isVerified;
        string grade;
        address parent;
    }

    mapping(address => Student) public students;
    address[] public studentAddresses;

    address public admin;

    event StudentAdded(address indexed studentAddress, string name, string studentId);
    event StudentVerified(address indexed studentAddress);
    event GradeAdded(address indexed studentAddress, string grade);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier studentExists(address _studentAddress) {
        require(bytes(students[_studentAddress].name).length != 0, "Student does not exist");
        _;
    }

    modifier onlyStudentOrParent(address _studentAddress) {
        require(msg.sender == _studentAddress || msg.sender == students[_studentAddress].parent, "Not authorized");
        _;
    }

    function addStudent(address _studentAddress, string memory _name, string memory _studentId, address _parent) public onlyAdmin {
        require(bytes(students[_studentAddress].name).length == 0, "Student already exists");
        require(!isStudentIdExists(_studentId), "Student ID already exists");

        Student memory newStudent = Student({
            name: _name,
            studentId: _studentId,
            isVerified: false,
            grade: "",
            parent: _parent
        });
        students[_studentAddress] = newStudent;
        studentAddresses.push(_studentAddress);

        emit StudentAdded(_studentAddress, _name, _studentId);
    }

    function verifyStudent(address _studentAddress) public onlyAdmin studentExists(_studentAddress) {
        students[_studentAddress].isVerified = true;

        emit StudentVerified(_studentAddress);
    }

    function addGrade(address _studentAddress, string memory _grade) public onlyAdmin studentExists(_studentAddress) {
        students[_studentAddress].grade = _grade;

        emit GradeAdded(_studentAddress, _grade);
    }

    function getStudent(address _studentAddress) public view returns (string memory, string memory, bool, string memory, address) {
        Student memory s = students[_studentAddress];
        return (s.name, s.studentId, s.isVerified, s.grade, s.parent);
    }

    function getGrade(address _studentAddress) public view onlyStudentOrParent(_studentAddress) returns (string memory) {
        return students[_studentAddress].grade;
    }

    function isStudentIdExists(string memory _studentId) internal view returns (bool) {
        for (uint i = 0; i < studentAddresses.length; i++) {
            if (keccak256(bytes(students[studentAddresses[i]].studentId)) == keccak256(bytes(_studentId))) {
                return true;
            }
        }
        return false;
    }
}
