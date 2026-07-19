"use client";
import styles from "../styles/UserDirectorySelect.module.scss";
import Divider from "../../segment/Divider";

import {EmpType} from "../types/user-directory.type";

type FilteredResultProps = {
	grouped: Map<string, EmpType[]>;
	onSelect: (type: "emp" | "dept", payload: any) => void;
};

export default function FilteredResult({
	grouped,
	onSelect,
}: FilteredResultProps) {
	return (
		<div className={styles.filteredEmpList}>
			{Array.from(grouped.entries()).map(([deptCd, emps]) => {
				const deptNm = emps[0]?.deptNm || "부서 없음";
				return (
					<div key={deptCd} className={styles.filteredGroup}>
						<Divider type="middle" />

						<div
							className={styles.dept}
							onClick={() =>
								onSelect("dept", {
									type: "dept",
									deptCd,
									deptNm,
								})
							}
						>
							<strong>{deptNm}</strong>
						</div>
						{emps.map((emp) => (
							<p
								key={emp.userId}
								className={styles.emp}
								onClick={() =>
									onSelect("emp", {
										type: "emp",
										userId: emp.userId,
										korNm: emp.korNm,
										posNm: emp.posNm,
										deptCd: emp.deptCd,
										deptNm: emp.deptNm,
										jobGroup: emp.jobGroup,
										jobGroupNm: emp.jobGroupNm,
									})
								}
							>
								{emp.korNm} {emp.posNm} / {emp.jobGroupNm} /{" "}
								{emp.deptNm}
							</p>
						))}
					</div>
				);
			})}
		</div>
	);
}
