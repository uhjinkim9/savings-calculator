"use client";
import styles from "./styles/AddCustomBoard.module.scss";
import {ChangeEvent, useEffect, useState} from "react";

import {useBoardContext} from "@/context/BoardContext";
import {requestPost} from "@/util/api/api-service";
import {isNotEmpty} from "@/util/validators/check-empty";

import {SelectOptionType} from "@/types/common.type";
import {SideBarMenuType} from "@/types/menu.type";

import SelectBoxBasic from "@/components/common/form-properties/SelectBoxBasic";
import InputBasic from "@/components/common/form-properties/InputBasic";
import UserDirectorySelect from "@/components/common/user-directory/UserDirectorySelect";
import InputTextArea from "@/components/common/form-properties/InputTextArea";




export default function AddBoard() {
	const {boardMenus, boardState, boardDispatch} = useBoardContext();
	const {board, mode, selected} = boardState;
	const [selectBoxOpts, setSelectBoxOpts] = useState<SelectOptionType[]>([]);

	function onChangeBoard(
		e: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) {
		const {name, value} = e.target;
		let val;
		if (name === "orgSelected") {
			const org = value as unknown as {
				empNos: string[];
				deptCds: string[];
			};
			["joinEmpNo", "joinDeptCd"].forEach((field) => {
				const keys = field === "joinEmpNo" ? org.empNos : org.deptCds;
				if (isNotEmpty(keys)) {
					boardDispatch({
						type: "UPDATE_BOARD_FIELD",
						payload: {
							name: field as keyof SideBarMenuType,
							value: keys.join(","),
						},
					});
				}
			});
			return;
		} else {
			val = value;
		}

		boardDispatch({
			type: "UPDATE_BOARD_FIELD",
			payload: {
				name: name as keyof typeof board,
				value: value,
			},
		});
	}

	async function getBoard() {
		const res = await requestPost("/board/getBoard", {menuIdx: selected});
		if (res.statusCode === 200) {
			boardDispatch({
				type: "SET_BOARD",
				payload: res.data,
			});
		}
	}

	// 수정 모드일 경우에만 selected(menuIdx)에 따라 게시판 정보 가져와서 세팅
	useEffect(() => {
		if (mode === "edit" && selected) {
			getBoard();
		} else {
			return;
		}
	}, [selected]);

	useEffect(() => {
		const labelMap = boardMenus.psBoards.map((b) => ({
			label: b.menuNm,
			value: b.menuId,
			idx: b.menuIdx,
		}));

		setSelectBoxOpts(labelMap);
	}, [boardMenus]);

	return (
		<>
			<div className={styles.row}>
				<SelectBoxBasic
					label="상위 메뉴" // upperNode 셀박으로 할지 아님 입력으로 할지?
					onChange={onChangeBoard}
					name="upperNode"
					value={board?.upperNode}
					customOptions={selectBoxOpts.filter(
						(opt) => opt.idx !== selected
					)}
				></SelectBoxBasic>
			</div>

			<div className={styles.row}>
				<InputBasic
					type="text"
					label="게시판 ID"
					onChange={onChangeBoard}
					placeholder="추후 변경 불가"
					name="menuId"
					value={board?.menuId}
					readOnly={mode === "edit"}
				></InputBasic>
			</div>
			<div className={styles.row}>
				<InputBasic
					type="text"
					label="게시판 이름"
					onChange={onChangeBoard}
					name="menuNm"
					value={board?.menuNm}
				></InputBasic>
			</div>

			<div className={styles.row}>
				<InputBasic
					type="number"
					label="노드 레벨" // 셀박 또는 정수 입력
					onChange={onChangeBoard}
					placeholder="추후 변경 불가"
					name="nodeLevel"
					value={board?.nodeLevel}
				></InputBasic>
			</div>

			<div className={styles.row}>
				<InputTextArea
					componentType="grayBorder"
					onChange={onChangeBoard}
					name="memo"
					value={board?.memo}
					label="메모"
				></InputTextArea>
			</div>
			<div className={styles.row}>
				<UserDirectorySelect
					multi={true}
					label="공개 대상"
					value={{
						joinEmpNo: board.joinEmpNo,
						joinDeptCd: board.joinDeptCd,
					}}
					onChange={onChangeBoard}
				/>
			</div>
		</>
	);
}
