"use client";
import {useEffect, useMemo, useState} from "react";
import styles from "./styles/UserDirectoryView.module.scss";
import {RiOrganizationChart} from "react-icons/ri";
import {DeptType, EmpType, UserDirectoryTreeType} from "./types/user-directory.type";
import {externalPost} from "@/util/api/api-service";
import {isEmpty} from "@/util/validators/check-empty";
import FilteredResult from "./part/FilteredResult";
import TreeNode from "./part/TreeNode";
import Modal from "../layout/Modal";
import useModal from "@/hooks/useModal";
import ProfileCard from "./ProfileCard";

type Props = {
	userDirectoryModal: any;
};

export default function UserDirectoryView({userDirectoryModal}: Props) {
	const [lists, setLists] = useState<{
		deptList: DeptType[];
		empList: EmpType[];
	}>({
		deptList: [],
		empList: [],
	});
	const deptList = lists?.deptList || [];
	const empList = lists?.empList || [];

	const [expanded, setExpanded] = useState<Record<string, boolean>>({
		"0000": true,
	});
	const [searchWord, setSearchWord] = useState("");

	async function getUserDirectoryData() {
		const res = await externalPost("/apiKey/hr/erpOrgTree.do");
		if (res?.data) setLists(res.data);
	}

	useEffect(() => {
		getUserDirectoryData();
	}, []);

	function toggle(deptCd: string) {
		setExpanded((prev) => ({
			...prev,
			[deptCd]: !prev[deptCd],
		}));
	}

	const handleEnter = () => {
		const word = searchWord.trim();
		if (!word) return;

		// 검색어 필터링하여 모달 열기
		const matchedEmps = empList.filter((emp) => emp.korNm?.includes(word));
		const matchedDepts = deptList.filter((dept) =>
			dept.deptNm?.includes(word)
		);

		if (matchedEmps.length > 0 || matchedDepts.length > 0) {
			userDirectoryModal.openModal();
		}
	};

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			handleEnter();
		}
	}

	const treeRepeater = (list: DeptType[]): UserDirectoryTreeType[] => {
		const tree = list.map((dept) => {
			const emps = empList.filter(
				(emp) => dept.deptCd === emp.deptCd && emp.empType !== "6"
			);

			return {
				deptCd: dept.deptCd,
				deptNm: dept.deptNm,
				upperDeptCd: dept.upperDeptCd,
				mngEmpNo: dept.mngEmpNo,
				emps: emps,
				children: children(dept.deptCd || ""),
			} as UserDirectoryTreeType;
		});
		return tree;
	};

	function children(upperCd: string): UserDirectoryTreeType[] {
		const levelDepts = deptList.filter(
			(dept) => dept.upperDeptCd === upperCd
		);
		const tree = treeRepeater(levelDepts);
		return tree;
	}

	const buildTree = (): UserDirectoryTreeType[] => {
		const topNodes = lists.deptList.filter((dept) =>
			isEmpty(dept.upperDeptCd)
		);
		return treeRepeater(topNodes);
	};

	useEffect(() => {
		buildTree();
	}, [lists]);

	const filteredList = useMemo(() => {
		// 검색어가 2자 미만이면 필터링하지 않음
		if (searchWord.length < 2) return [];
		return empList.filter(
			// 검색 대상 필드들을 배열로 만들고, 일부라도 포함되면 true
			(emp) =>
				[emp.korNm, emp.deptNm, emp.jobGroupNm] // null 가능성 있음
					.filter(Boolean) // undefined, null 제거
					.some((field) => field?.includes(searchWord)) // 하나라도 포함되면 OK
		);
	}, [empList, searchWord]);

	const grouped = useMemo(() => {
		const groups = new Map<string, EmpType[]>();
		filteredList.forEach((emp) => {
			const key = emp.deptCd ?? "noDeptCd";

			// .set(): Map에 새로운 키-값 쌍을 추가하거나, 이미 있는 키의 값을 업데이트
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)?.push(emp);
		});
		return groups;
	}, [filteredList]);

	const searchInput = (
		<input
			onChange={(e) => setSearchWord(e.target.value)}
			onKeyDown={handleKeyDown}
			className={styles.inputEmp}
			value={searchWord}
			placeholder="성명 및 부서명"
		></input>
	);

	const clearSearchWord = (
		<span onClick={() => setSearchWord("")} className={styles.closeButton}>
			×
		</span>
	);

	const openUserDirectory = () => {
		userDirectoryModal.openModal();
	};

	const profileCardModal = useModal();

	function handleSelect(type: string, payload: any) {
		// 직원 클릭 시에만 프로필 카드 열기
		if (type === "emp") {
			profileCardModal.openModal();
		}
		// 검색 칸 초기화
		setSearchWord("");
	}

	// onlyShow
	return (
		<>
			{/* 조직도 열기 버튼 */}
			<button className={styles.directoryButton} onClick={openUserDirectory}>
				<span>
					<RiOrganizationChart className={styles.directoryIcon} />
				</span>{" "}
				<span className={styles.directoryButtonText}>조직도</span>
			</button>

			{/* 조직도 모달 내용 */}
			<Modal
				closeModal={userDirectoryModal.closeModal}
				modalConfig={userDirectoryModal.modalConfig}
				width="30vw"
				height="55vh"
			>
				<div className={styles.treeContainer}>
					<div className={styles.treeWrapper}>
						{searchInput}
						{clearSearchWord}

						{isEmpty(searchWord) ? (
							buildTree().map((node) => (
								<TreeNode
									key={node.deptCd}
									node={node}
									level={0}
									expanded={expanded}
									toggle={toggle}
									selectedTargets={[]}
									onSelect={handleSelect}
									onlyView={true}
								/>
							))
						) : (
							<FilteredResult
								grouped={grouped}
								onSelect={handleSelect}
							/>
						)}
					</div>
				</div>
			</Modal>

			{/* 프로필 카드 컴포넌트 */}
			<ProfileCard profileCardModal={profileCardModal} />
		</>
	);
}
