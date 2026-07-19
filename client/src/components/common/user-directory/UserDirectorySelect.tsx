"use client";
import styles from "./styles/UserDirectorySelect.module.scss";
import {useEffect, useMemo, useState} from "react";
import clsx from "clsx";

import {isEmpty} from "@/util/validators/check-empty";
import {externalPost} from "@/util/api/api-service";
import {
	DeptType,
	EmpType,
	UserDirectoryTreeType,
	SelectedDept,
	SelectedEmp,
	SelectedTarget,
} from "./types/user-directory.type";
import useModal from "@/hooks/useModal";

import Modal from "../layout/Modal";
import InputBasic from "../form-properties/InputBasic";
import ButtonBasic from "../form-properties/ButtonBasic";
import TreeNode from "./part/TreeNode";
import FilteredResult from "./part/FilteredResult";

export default function UserDirectorySelect<T>({
	onChange,
	multi = false,
	buttonLabel = "선택",
	name = "orgSelected",
	// 상위에서 넘겨주는 value 구조
	value,
	label = "",
	width,
	placeHolder = "성명 및 부서명",
}: {
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	multi?: boolean;
	buttonLabel?: string;
	inputLabel?: string;
	name?: string;
	value?: any;
	label?: string;
	width?: string;
	placeHolder?: string;
}) {
	// ERP에서 가져온 데이터 세팅 상태
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
	const [selectedTargets, setSelectedTargets] = useState<SelectedTarget[]>(
		[]
	);

	// useEffect(() => {
	// 	console.log("selectedTargets", selectedTargets);
	// }, [selectedTargets]);

	// 초기화 여부를 확인하기 위한 useRef
	// 컴포넌트가 처음 렌더링될 때만 하는 초기화
	useEffect(() => {
		if (!value || (empList.length === 0 && deptList.length === 0)) return;

		// 이미 초기화된 상태라면 중복 실행 방지
		if (selectedTargets.length > 0) return;

		const selected: SelectedTarget[] = [];

		// 초기 세팅용 value 파싱
		if (value.joinUserId) {
			const userIds = value.joinUserId.split(",");
			const matchedEmps = empList.filter((emp) =>
				userIds.includes(emp.userId)
			);
			matchedEmps.forEach((emp) => {
				if (
					emp.userId &&
					emp.empNo &&
					emp.korNm &&
					emp.posNm &&
					emp.deptNm
				) {
					selected.push(createSelectedEmp(emp));
				}
			});
		}

		if (value.joinDeptCd) {
			const deptCds = value.joinDeptCd.split(",");
			const matchedDepts = deptList.filter((dept) =>
				deptCds.includes(dept.deptCd)
			);
			matchedDepts.forEach((dept) => {
				selected.push({
					type: "dept",
					deptCd: dept.deptCd ?? "",
					deptNm: dept.deptNm ?? "",
				});
			});
		}

		setSelectedTargets(selected);
	}, [empList, deptList, value]);

	const {openModal, closeModal, modalConfig} = useModal();

	async function getUserDirectoryData() {
		const res = await externalPost("/apiKey/hr/erpOrgTree.do");
		if (res?.data) setLists(res.data);
	}

	useEffect(() => {
		buildTree();
	}, [lists]);

	useEffect(() => {
		getUserDirectoryData();
	}, []);

	function toggle(deptCd: string) {
		setExpanded((prev) => ({
			...prev,
			[deptCd]: !prev[deptCd],
		}));
	}

	// emp 객체를 SelectedEmp 타입으로 변환하는 헬퍼 함수
	const createSelectedEmp = (emp: EmpType): SelectedTarget => ({
		type: "emp",
		userId: emp.userId || "",
		empNo: emp.empNo || "",
		korNm: emp.korNm || "",
		posNm: emp.posNm || "",
		deptCd: emp.deptCd || "",
		deptNm: emp.deptNm || "",
		jobGroup: emp.jobGroup || "",
		jobGroupNm: emp.jobGroupNm || "",
	});

	// dept 객체를 SelectedDept 타입으로 변환하는 헬퍼 함수
	const createSelectedDept = (dept: DeptType): SelectedTarget => ({
		type: "dept",
		deptCd: dept.deptCd || "",
		deptNm: dept.deptNm || "",
	});

	function handleSelect(type: string, payload: any) {
		if (type === "emp") {
			// 중복 방지
			if (
				multi &&
				selectedTargets.find(
					(t) => t.type === "emp" && t.userId === payload.userId
				)
			)
				return;

			const newTarget = createSelectedEmp(payload);
			const updated = multi
				? [...selectedTargets, newTarget]
				: [newTarget];
			setSelectedTargets(updated);

			triggerOnChange("orgSelected", {
				userIds: updated
					.filter((e) => e.type === "emp")
					.map((e) => (e as SelectedEmp).userId),
				deptCds: updated
					.filter((d) => d.type === "dept")
					.map((d) => (d as SelectedDept).deptCd),
			});
		} else {
			// 부서 선택 처리: 해당 부서(및 하위 부서)의 모든 직원과 부서 추가
			const rootDeptCd = payload.deptCd as string;

			// 하위 부서 코드들을 재귀적으로 수집
			const collectDeptCds = (root: string): Set<string> => {
				const set = new Set<string>();
				const q: string[] = [root];

				while (q.length) {
					const cur = q.shift() as string;
					if (set.has(cur)) continue;
					set.add(cur);

					// 현재 부서의 하위 부서들 찾기
					const children = deptList.filter(
						(d) => d.upperDeptCd === cur
					);
					children.forEach((c) => c.deptCd && q.push(c.deptCd));
				}
				return set;
			};

			const deptSet = collectDeptCds(rootDeptCd);

			// 해당 부서들의 모든 직원 찾기
			const deptEmps = empList
				.filter(
					(emp) =>
						emp.userId &&
						emp.deptCd &&
						deptSet.has(emp.deptCd) &&
						emp.empType !== "6"
				)
				.map((emp) => createSelectedEmp(emp));

			// 해당 부서들 찾기
			const deptTargets = deptList
				.filter((dept) => dept.deptCd && deptSet.has(dept.deptCd))
				.map((dept) => createSelectedDept(dept));

			if (multi) {
				// 중복 제거를 위해 기존 선택된 항목들과 비교
				const existingUserIds = selectedTargets
					.filter((t) => t.type === "emp")
					.map((t) => (t as SelectedEmp).userId);
				const existingDeptCds = selectedTargets
					.filter((t) => t.type === "dept")
					.map((t) => (t as SelectedDept).deptCd);

				const newEmps = deptEmps.filter(
					(emp) =>
						!existingUserIds.includes((emp as SelectedEmp).userId)
				);
				const newDepts = deptTargets.filter(
					(dept) =>
						!existingDeptCds.includes((dept as SelectedDept).deptCd)
				);

				const updated = [...selectedTargets, ...newEmps, ...newDepts];
				setSelectedTargets(updated);

				triggerOnChange("orgSelected", {
					userIds: updated
						.filter((e) => e.type === "emp")
						.map((e) => (e as SelectedEmp).userId),
					deptCds: updated
						.filter((d) => d.type === "dept")
						.map((d) => (d as SelectedDept).deptCd),
				});
			} else {
				// 단일 선택 모드에서는 첫 번째 직원만 선택
				const firstEmp = deptEmps[0];
				const updated = firstEmp
					? [firstEmp]
					: [createSelectedDept(payload)];
				setSelectedTargets(updated);

				triggerOnChange("orgSelected", {
					userIds: updated
						.filter((e) => e.type === "emp")
						.map((e) => (e as SelectedEmp).userId),
					deptCds: updated
						.filter((d) => d.type === "dept")
						.map((d) => (d as SelectedDept).deptCd),
				});
			}
		}

		// 검색 칸 초기화
		setSearchWord("");
	}

	// 상위 컴포넌트의 prop인 onChange 발동
	const triggerOnChange = (name: string, val: any) => {
		// 문자열 합치기 로직을 내부에서 처리
		const enhancedVal = {
			...val,
			joinUserId: val.userIds?.join(",") || "",
			joinDeptCd: val.deptCds?.join(",") || "",
		};

		const fakeEvent = {
			target: {name, value: enhancedVal},
		} as unknown as React.ChangeEvent<HTMLInputElement> & {
			target: {
				name: string;
				value: {
					userIds: string[];
					deptCds: string[];
					joinUserId: string;
					joinDeptCd: string;
				};
			};
		};
		onChange?.(fakeEvent);
	};

	function removeSelected(target: SelectedTarget) {
		// 대상이 아닌 것 거르기
		const updated = selectedTargets.filter((t) =>
			target.type === "emp"
				? t.type !== "emp" || t.userId !== target.userId
				: t.type !== "dept" || t.deptCd !== target.deptCd
		);
		setSelectedTargets(updated);

		triggerOnChange("orgSelected", {
			userIds: updated
				.filter((e) => e.type === "emp")
				.map((e) => (e as SelectedEmp).userId),
			deptCds: updated
				.filter((d) => d.type === "dept")
				.map((d) => (d as SelectedDept).deptCd),
		});
	}

	const handleEnter = () => {
		const word = searchWord.trim();
		if (!word) return;

		// 검색어 필터링
		const matchedEmps = empList.filter((emp) => emp.korNm?.includes(word));
		const matchedDepts = deptList.filter((dept) =>
			dept.deptNm?.includes(word)
		);

		// 검색된 이름이 하나인 경우 바로 선택
		if (matchedEmps.length === 1 && matchedDepts.length === 0) {
			handleSelect("emp", matchedEmps[0]);
			setSearchWord("");
		} else if (matchedDepts.length === 1 && matchedEmps.length === 0) {
			handleSelect("dept", {
				deptCd: matchedDepts[0].deptCd,
				deptNm: matchedDepts[0].deptNm,
			});
			setSearchWord("");
		} else {
			openModal();
		}
	};

	const handleBackspace = () => {
		if (searchWord !== "") return;

		const last = selectedTargets.at(-1);
		if (!last) return;

		const updated = selectedTargets.slice(0, -1);
		setSelectedTargets(updated);

		triggerOnChange("orgSelected", {
			userIds: updated
				.filter((e) => e.type === "emp")
				.map((e) => (e as SelectedEmp).userId),
			deptCds: updated
				.filter((d) => d.type === "dept")
				.map((d) => (d as SelectedDept).deptCd),
		});
	};

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			handleEnter();
		} else if (e.key === "Backspace") {
			handleBackspace();
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

	const searchInput =
		multi || selectedTargets.length === 0 ? (
			<InputBasic
				onChange={(e: any) => {
					const raw = e.target.value;
					const word = /^[a-zA-Z]+$/.test(raw)
						? raw.toUpperCase()
						: raw;
					setSearchWord(word);
				}}
				onKeyDown={handleKeyDown}
				name="searchWord"
				value={searchWord}
				placeholder={placeHolder}
			/>
		) : null;

	const clearSearchWord = (
		<span onClick={() => setSearchWord("")} className={styles.closeButton}>
			×
		</span>
	);

	const RemoveTargetButton = (target: SelectedTarget) => (
		<span
			onClick={() => removeSelected(target)}
			className={styles.closeButton}
		>
			×
		</span>
	);

	return (
		<div className={styles.container} style={{width: width}}>
			<div className={clsx("subText", styles.searchedEmps)}>
				{label && <span className={styles.label}>{label}</span>}
				{selectedTargets.map((target, idx) => (
					<span key={idx} className={styles.selectedItem}>
						<span>
							{target.type === "emp"
								? `${target.korNm} ${target.posNm}`
								: target.deptNm}
						</span>
						<span
							className={styles.closeButton}
							onClick={() => removeSelected(target)}
						>
							×
						</span>
					</span>
				))}
				{searchInput}
				{(multi || selectedTargets.length === 0) && (
					<ButtonBasic
						onClick={openModal}
						width="3.5rem"
						onHoverOpaque
					>
						{buttonLabel}
					</ButtonBasic>
				)}
			</div>

			<Modal
				closeModal={closeModal}
				modalConfig={modalConfig}
				width="30vw"
				height="55vh"
			>
				<div className={styles.treeContainer}>
					<div className={styles.treeWrapper}>
						<div className={styles.searchInput}>
							{searchInput}
							{clearSearchWord}
						</div>

						{isEmpty(searchWord) ? (
							buildTree().map((node) => (
								<TreeNode
									key={node.deptCd}
									node={node}
									level={0}
									expanded={expanded}
									toggle={toggle}
									selectedTargets={selectedTargets}
									onSelect={handleSelect}
								/>
							))
						) : (
							<FilteredResult
								grouped={grouped}
								onSelect={handleSelect}
							/>
						)}
					</div>

					{multi && (
						<div className={styles.empsWapper}>
							<div className={styles.selectedEmpsWrapper}>
								<div className={styles.selectedEmpWrapper}>
									{selectedTargets.map((target, idx) => (
										<div
											key={idx}
											className={styles.selectedEmps}
										>
											{target.type === "emp"
												? target.korNm
												: target.deptNm}
											{RemoveTargetButton(target)}
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</Modal>
		</div>
	);
}
