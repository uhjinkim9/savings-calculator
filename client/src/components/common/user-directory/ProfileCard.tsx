"use client";
import styles from "./styles/ProfileCard.module.scss";
import {LocalStorage} from "@/util/common/storage";
import ProfileImage from "../segment/ProfileImage";
import Modal from "../layout/Modal";
import {CiMail, CiPhone, CiStar} from "react-icons/ci";

type Props = {
	profileCardModal: any;
};

export default function ProfileCard({profileCardModal}: Props) {
	const {closeModal, modalConfig} = profileCardModal;

	return (
		<Modal
			closeModal={closeModal}
			modalConfig={modalConfig}
			width="35vw"
			height="40vh"
		>
			<div className={styles.wrapper}>
				<div className={styles.above}>
					<ProfileImage
						path="/ko-kil-dong.png"
						alt="profile"
						size="180px"
					/>
					<div className={styles.infoWrapper}>
						<div className={styles.info}>
							<div className={styles.nameWrapper}>
								<span className={styles.name}>김어진 사원</span>
								<CiStar className={styles.starIcon} />
							</div>
							<span className={styles.duty}>인사부 팀원</span>
							<span className={styles.dept}>
								전략기획본부 / 인사부 / IT
							</span>
						</div>
						<div className={styles.contact}>
							<span>
								<CiMail />
								이메일 아이콘, 이메일
							</span>
							<span>
								<CiPhone />
								전화 아이콘, 전화번호
							</span>
						</div>
					</div>
				</div>
				<div className={styles.status}>
					<span>회의 중 등 상태</span>
				</div>
			</div>
		</Modal>
	);
}
