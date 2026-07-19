"use client";
import styles from "../styles/UserDirectorySelect.module.scss";
import {UserDirectoryTreeType} from "../types/user-directory.type";
import {FaChevronDown, FaChevronRight, FaStar, FaFolder} from "react-icons/fa6";
import {motion, AnimatePresence} from "framer-motion";
import Button from "../../form-properties/Button";

type SelectedTarget = {
	type: "emp" | "dept";
	userId?: string;
	deptCd?: string;
	korNm?: string;
	posNm?: string;
	deptNm?: string;
};

type Props = {
	node: UserDirectoryTreeType;
	level: number;
	expanded: Record<string, boolean>;
	toggle: (deptCd: string) => void;
	selectedTargets: SelectedTarget[];
	onSelect: (type: "emp" | "dept", payload: any) => void;
	onlyView?: boolean;
};

export default function TreeNode({
	node,
	level,
	expanded,
	toggle,
	selectedTargets,
	onSelect,
	onlyView = false,
}: Props) {
	return (
		<div key={node.deptCd} style={{marginLeft: 30}}>
			<div className={styles.nodeRow}>
				<div
					className={styles.dept}
					onClick={() => toggle(node.deptCd || "")}
				>
					{node.children?.length ? (
						expanded[node.deptCd || ""] ? (
							<FaChevronDown />
						) : (
							<FaChevronRight />
						)
					) : (
						<FaFolder className={styles.folderIcon} />
					)}
					{node.deptNm}
				</div>

				{!onlyView && (
					<Button
						componentType="smallGray"
						onClick={() =>
							onSelect("dept", {
								type: "dept",
								deptCd: node.deptCd,
								deptNm: node.deptNm,
							})
						}
						onHoverOpaque
						width="2.8rem"
					>
						선택
					</Button>
				)}
			</div>

			<AnimatePresence initial={false}>
				{expanded[node.deptCd || ""] && (
					<motion.div
						initial={{opacity: 0, height: 0}}
						animate={{opacity: 1, height: "auto"}}
						exit={{opacity: 0, height: 0}}
						transition={{duration: 0.3}}
					>
						{node.emps?.map((emp) => {
							const isSelected = selectedTargets.some(
								(t) =>
									t.type === "emp" && t.userId === emp.userId
							);

							return (
								<div
									key={emp.userId}
									className={styles.emps}
									style={{
										color: isSelected ? "#FF6900" : "black",
									}}
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
									<span className={styles.emp}>
										{node.mngEmpNo === emp.userId && (
											<FaStar
												className={styles.starIcon}
											/>
										)}
										{emp.posNm
											? ` ${emp.korNm} ${emp.posNm}`
											: ` ${emp.korNm}`}
									</span>
								</div>
							);
						})}

						{node.children?.map((child) => (
							<TreeNode
								key={child.deptCd}
								node={child}
								level={level + 1}
								expanded={expanded}
								toggle={toggle}
								selectedTargets={selectedTargets}
								onSelect={onSelect}
								onlyView={onlyView}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
