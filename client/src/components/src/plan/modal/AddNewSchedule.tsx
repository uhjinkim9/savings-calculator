"use client";
import styles from "../styles/PlanModal.module.scss";
import clsx from "clsx";
import {motion, AnimatePresence} from "framer-motion";

import {convertDayNumberToChar} from "@/components/src/plan/etc/calendar-helper";
import {usePlanContext} from "@/context/PlanContext";
import {
	CalendarSelectOptionType,
	period,
	RepeatTypes,
	RepeatEndTypes,
	ScheduleType,
} from "@/types/plan.type";

import DateTimeRangePicker from "@/components/common/form-properties/DateTimeRangePicker";
import SelectBox from "@/components/common/form-properties/SelectBox";
import Toggle from "@/components/common/form-properties/Toggle";
import Radio from "@/components/common/form-properties/Radio";
import UserDirectorySelect from "@/components/common/user-directory/UserDirectorySelect";
import InputBasic from "@/components/common/form-properties/InputBasic";
import {
	RepeatIntervalInput,
	RepeatEndTypeSelect,
	RepeatCountNode,
	RepeatUntilNode,
} from "../RepeatNodes";
import {useEffect} from "react";
import {isNotEmpty} from "@/util/validators/check-empty";

export default function AddNewSchedule({
	calendarGroup,
	onChangeNewPlan,
	onChangeRepeatRule,
	whichDayinTheMonth,
}: {
	calendarGroup: CalendarSelectOptionType[];
	onChangeNewPlan: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
	onChangeRepeatRule: (e: React.ChangeEvent<any>) => void;
	whichDayinTheMonth: {label: string; value: any}[];
}) {
	const {
		planState,
		scheduleState,
		scheduleDispatch,
		repeatRuleState,
		repeatRuleDispatch,
	} = usePlanContext();
	const {plan, selected} = planState;
	const {schedule} = scheduleState;
	const {repeatRule} = repeatRuleState;

	// Schedule 상세 필드 변경 핸들러
	function onChangeSchedule(
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) {
		const {name, value} = e.target;

		let val;
		if (name === "orgSelected") {
			// 이중 단언(double assertion)
			const org = value as unknown as {
				empNos: string[]; // 사번이므로 empNos가 직관적
				deptCds: string[];
			};

			// 조건 분기 중복 제거
			["joinEmpNo", "joinDeptCd"].forEach((field) => {
				const keys = field === "joinEmpNo" ? org.empNos : org.deptCds;

				if (isNotEmpty(keys)) {
					const joinedValue = keys.join(",");
					scheduleDispatch({
						type: "UPDATE_SCHEDULE_FIELD",
						payload: {
							name: field as keyof ScheduleType,
							value: joinedValue,
						},
					});
				} else {
					// 빈 값도 dispatch하여 상태를 초기화
					scheduleDispatch({
						type: "UPDATE_SCHEDULE_FIELD",
						payload: {
							name: field as keyof ScheduleType,
							value: "",
						},
					});
				}
			});
			// 여기서 끝내야 아래 기본 디스패치 안 탐
			return;
		} else {
			val = value;
		}

		scheduleDispatch({
			type: "UPDATE_SCHEDULE_FIELD",
			payload: {name: name as keyof ScheduleType, value},
		});
	}

	// 반복 주기 값
	const repeatFrequency = repeatRule?.freq;

	useEffect(() => {
		// 일정 추가 또는 수정 시 planIdx 설정
		if (selected) {
			scheduleDispatch({
				type: "UPDATE_SCHEDULE_FIELD",
				payload: {name: "planIdx", value: selected},
			});
			repeatRuleDispatch({
				type: "UPDATE_REPEAT_RULE_FIELD",
				payload: {name: "planIdx", value: selected},
			});
		}
		// else {
		// 	scheduleDispatch({
		// 		type: "UPDATE_SCHEDULE_FIELD",
		// 		payload: {name: "planIdx", value: null},
		// 	});
		// 	repeatRuleDispatch({
		// 		type: "UPDATE_REPEAT_RULE_FIELD",
		// 		payload: {name: "planIdx", value: null},
		// 	});
		// }
	}, [selected]);

	return (
		<div className={styles.wrapper}>
			<div className={styles.row}>
				<InputBasic
					label="제목"
					onChange={onChangeNewPlan}
					value={plan?.title}
					name="title"
				/>
				<SelectBox
					componentType="smallGray"
					name="menuIdx"
					value={plan?.menuIdx}
					defaultLabel="일정 그룹"
					width="8rem"
					customOptions={calendarGroup}
					onChange={onChangeNewPlan}
				/>
			</div>

			<div className={styles.row}>
				<span className={styles.label}>날짜</span>
				<DateTimeRangePicker
					startedAt={plan.startedAt}
					endedAt={plan.endedAt}
					onChange={onChangeNewPlan}
					isDateOnly={plan.isAllday}
					isStartDayOnly={plan.isRepeated}
				/>
			</div>

			<div className={clsx(styles.row, styles.gap2rem)}>
				<div className={clsx(styles.row)}>
					<span className={styles.label}>종일</span>
					<Toggle
						name="isAllday"
						value={plan?.isAllday}
						onChange={onChangeNewPlan}
					/>
				</div>
				<div className={clsx(styles.row)}>
					<span className={styles.label}>반복</span>
					<Toggle
						name="isRepeated"
						value={plan.isRepeated}
						onChange={onChangeNewPlan}
					/>
				</div>
			</div>

			<div className={styles.selectRepeatPeriod}>
				<AnimatePresence>
					{plan.isRepeated && (
						<motion.div
							initial={{height: 0, opacity: 0}}
							animate={{height: "auto", opacity: 1}}
							exit={{height: 0, opacity: 0}}
							transition={{duration: 0.5, ease: "easeInOut"}}
							className={styles.selectRepeatPeriod}
						>
							<div className={styles.row}>
								<Radio
									name="freq"
									checkValue={RepeatTypes.DAILY}
									value={
										repeatFrequency === RepeatTypes.DAILY
									}
									onChange={onChangeRepeatRule}
								>
									일 반복
								</Radio>

								{repeatFrequency === RepeatTypes.DAILY && (
									<div className={styles.repeatDetail}>
										<RepeatIntervalInput
											value={repeatRule?.interval}
											onChange={onChangeRepeatRule}
										/>
										<span>일마다</span>
										<RepeatEndTypeSelect
											value={repeatRule?.repeatEndType}
											onChange={onChangeRepeatRule}
											options={period}
										/>

										{repeatRule?.repeatEndType ===
											RepeatEndTypes.COUNT && (
											<RepeatCountNode
												value={repeatRule?.count}
												onChange={onChangeRepeatRule}
											/>
										)}
										{repeatRule?.repeatEndType ===
											RepeatEndTypes.UNTIL && (
											<RepeatUntilNode
												value={repeatRule?.until}
												onChange={onChangeRepeatRule}
											/>
										)}
										<span>반복</span>
									</div>
								)}
							</div>

							<div className={styles.row}>
								<Radio
									name="freq"
									checkValue={RepeatTypes.WEEKLY}
									value={
										repeatFrequency === RepeatTypes.WEEKLY
									}
									onChange={onChangeRepeatRule}
								>
									주 반복
								</Radio>

								{repeatFrequency === RepeatTypes.WEEKLY && (
									<div className={styles.repeatDetail}>
										<RepeatIntervalInput
											value={repeatRule?.interval}
											onChange={onChangeRepeatRule}
										/>
										<span>주 주기로 </span>
										<span>
											{convertDayNumberToChar(
												Number(repeatRule?.byweekday),
												"kor"
											)}
											요일마다
										</span>
										<RepeatEndTypeSelect
											value={repeatRule?.repeatEndType}
											onChange={onChangeRepeatRule}
											options={period}
										/>

										{repeatRule?.repeatEndType ===
											RepeatEndTypes.COUNT && (
											<RepeatCountNode
												value={repeatRule?.count}
												onChange={onChangeRepeatRule}
											/>
										)}
										{repeatRule?.repeatEndType ===
											RepeatEndTypes.UNTIL && (
											<RepeatUntilNode
												value={repeatRule?.until}
												onChange={onChangeRepeatRule}
											/>
										)}
									</div>
								)}
							</div>

							<div className={styles.row}>
								<Radio
									name="freq"
									checkValue={RepeatTypes.MONTHLY}
									value={
										repeatFrequency === RepeatTypes.MONTHLY
									}
									onChange={onChangeRepeatRule}
								>
									월 반복
								</Radio>

								{repeatFrequency === RepeatTypes.MONTHLY && (
									<div className={styles.repeatDetail}>
										<RepeatIntervalInput
											value={repeatRule?.interval}
											onChange={onChangeRepeatRule}
										/>
										<span>개월 주기로 </span>
										<SelectBox
											name="bymonthday"
											value={repeatRule?.bymonthday}
											componentType="smallGray"
											customOptions={whichDayinTheMonth}
											onChange={onChangeRepeatRule}
										></SelectBox>
										<span>마다</span>

										<RepeatEndTypeSelect
											value={repeatRule?.repeatEndType}
											onChange={onChangeRepeatRule}
											options={period}
										/>
										{repeatRule?.repeatEndType ===
											RepeatEndTypes.COUNT && (
											<RepeatCountNode
												value={repeatRule.count}
												onChange={onChangeRepeatRule}
											/>
										)}
										{repeatRule?.repeatEndType ===
											RepeatEndTypes.UNTIL && (
											<RepeatUntilNode
												value={repeatRule.until}
												onChange={onChangeRepeatRule}
											/>
										)}
									</div>
								)}
							</div>

							<div className={styles.row}>
								<Radio
									name="freq"
									checkValue={RepeatTypes.YEARLY}
									value={
										repeatFrequency === RepeatTypes.YEARLY
									}
									onChange={onChangeRepeatRule}
								>
									연 반복
								</Radio>
								{repeatFrequency === RepeatTypes.YEARLY && (
									<div className={styles.repeatDetail}>
										<RepeatIntervalInput
											value={repeatRule?.interval}
											onChange={onChangeRepeatRule}
										/>

										<span>
											년 주기로{" "}
											{plan.startedAt
												? plan.startedAt
														.split("T")[0]
														.split("-")[1] || " - "
												: ""}
											월{" "}
											{plan.startedAt
												? plan.startedAt
														.split("T")[0]
														.split("-")[2] || " - "
												: ""}
											일마다
										</span>
										<RepeatEndTypeSelect
											value={repeatRule?.repeatEndType}
											onChange={onChangeRepeatRule}
											options={period}
										/>

										{repeatRule?.repeatEndType ===
											RepeatEndTypes.COUNT && (
											<RepeatCountNode
												value={repeatRule.count}
												onChange={onChangeRepeatRule}
											/>
										)}
										{repeatRule?.repeatEndType ===
											RepeatEndTypes.UNTIL && (
											<RepeatUntilNode
												value={repeatRule.until}
												onChange={onChangeRepeatRule}
											/>
										)}
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<div className={styles.row}>
				<UserDirectorySelect
					onChange={onChangeSchedule}
					buttonLabel="선택"
					inputLabel="내부 참석자"
					value={{
						joinEmpNo: schedule?.joinEmpNo,
						joinDeptCd: schedule?.joinDeptCd,
					}}
					multi
				></UserDirectorySelect>
			</div>

			<InputBasic
				label="외부 참석자"
				onChange={onChangeSchedule}
				value={schedule?.joinThirdParty || ""}
				name="joinThirdParty"
			></InputBasic>

			<InputBasic
				label="장소"
				onChange={onChangeSchedule}
				value={schedule?.location || ""}
				name="location"
			></InputBasic>

			<InputBasic
				label="메모"
				onChange={onChangeSchedule}
				value={schedule?.memo || ""}
				name="memo"
			></InputBasic>
		</div>
	);
}
