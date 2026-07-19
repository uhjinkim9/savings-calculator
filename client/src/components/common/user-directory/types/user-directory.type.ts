export type DeptType = {
	companyId?: string;
	createDate?: string;
	createUser?: string;
	deptCd?: string;
	deptCdNm?: string;
	deptLevel?: string;
	deptNm?: string;
	memo?: string;
	mngEmpNm?: string;
	mngEmpNo?: string;
	orgPath?: string;
	seqNum?: number;
	showYn?: string;
	updateDate?: string;
	updateUser?: string;
	upperDeptCd?: string;
	upperDeptNm?: string;
	useYn?: string;
	empNo?: string;
	korNm?: string;
};

export type UserDirectoryTreeType = {
	deptCd?: string;
	deptNm?: string;
	upperDeptCd?: string;
	mngEmpNo?: string;
	emps?: TreeEmpType[];
	children?: UserDirectoryTreeType[];
};

export type TreeEmpType = {
	userId?: string;
	empNo?: string;
	korNm?: string;
	posNm?: string;
	deptCd?: string;
	deptNm?: string;
	jobGroup?: string;
	jobGroupNm?: string;
	email?: string;
};

export type EmpType = {
	userId?: string;
	companyId?: string;
	companyNm?: string;
	empNo?: string;
	korNm?: string;
	chnNm?: string;
	engNm?: string;
	joinDate?: string;
	groupJoinDate?: string;
	empType?: string;
	empTypeNm?: string;
	jobType?: string;
	jobTypeNm?: string;
	deptCd?: string;
	deptNm?: string;
	dutyCd?: string;
	dutyNm?: string;
	posCd?: string;
	posNm?: string;
	birthDate?: string;
	birthMonth?: string;
	email?: string;
	extEmail?: string;
	jobGroup?: string;
	jobGroupNm?: string;
	mngCompany?: string;
	mobile?: string;
	newEmpNo?: string;
	orgPath?: string;
	photo?: string;
	seqNum?: string;
};

export type SelectedEmp = {
	userId: string;
	empNo: string;
	korNm: string;
	posNm: string;
	deptCd: string;
	deptNm: string;
	jobGroup: string;
	jobGroupNm: string;
	email?: string;
};

export type SelectedDept = {
	deptCd: string;
	deptNm: string;
};

// Tagged Union 타입
export type SelectedTarget =
	| ({type: "emp"} & SelectedEmp)
	| ({type: "dept"} & SelectedDept);
