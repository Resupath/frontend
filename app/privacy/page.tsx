import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "개인정보처리방침 | 면접 시뮬레이션",
    description: "면접 시뮬레이션 서비스의 개인정보처리방침입니다.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-gray-600 mb-8">
                        <strong>[면접 시뮬레이션]</strong>(이하 "본 서비스")의 운영자(이하 "운영자")는 개인정보 보호법
                        등 관련 법령을 준수하며, 사용자 여러분의 개인정보를 보호하기 위해 최선을 다하고 있습니다. 본
                        개인정보처리방침은 사용자가 본 서비스를 이용하며 제공한 개인정보가 어떻게 수집, 이용, 저장,
                        공유되는지 명확히 알리기 위해 작성되었습니다.
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 수집하는 개인정보 항목</h2>
                        <p className="mb-4">운영자는 아래와 같은 개인정보를 수집할 수 있습니다:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>필수 항목</strong>: 이름, 이메일 주소
                            </li>
                            <li>
                                <strong>선택 항목</strong>: 사용자의 대화 내용, 이력서 및 자기소개서, 포트폴리오 등
                                사용자가 업로드한 파일 정보
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 개인정보의 수집 및 이용 목적</h2>
                        <p className="mb-4">운영자는 다음과 같은 목적을 위해 개인정보를 수집 및 이용합니다:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>서비스 제공 및 운영</li>
                            <li>사용자 맞춤형 서비스 제공</li>
                            <li>서비스 개선 및 오류 분석</li>
                            <li>법령에 따른 의무 이행</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 개인정보의 보관 기간</h2>
                        <p className="mb-4">
                            운영자는 개인정보를 수집 목적 달성 후 즉시 삭제하거나, 관련 법령에서 정한 기간 동안
                            보관합니다.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>대화 기록 및 업로드된 파일: 서비스 개선을 위해 익명화하여 1년간 보관 후 삭제</li>
                            <li>이메일 주소: 사용자 요청에 따라 즉시 삭제 가능</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
                        <p className="mb-4">
                            운영자는 사용자의 개인정보를 외부에 제공하지 않습니다. 단, 아래의 경우에는 예외로 합니다:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>사용자가 사전에 동의한 경우</li>
                            <li>법령에 의거해 제공이 요구되는 경우</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 개인정보 보호를 위한 조치</h2>
                        <p className="mb-4">
                            운영자는 사용자의 개인정보를 안전하게 보호하기 위해 다음과 같은 조치를 취하고 있습니다:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>개인정보의 암호화</li>
                            <li>개인정보 접근 제한</li>
                            <li>보안 시스템의 주기적 점검</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 사용자의 권리 및 행사 방법</h2>
                        <p className="mb-4">사용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>개인정보 열람, 수정, 삭제 요청</li>
                            <li>개인정보 수집 및 이용에 대한 동의 철회 요청</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 문의처</h2>
                        <p className="mb-4">
                            개인정보와 관련된 문의사항이 있을 경우, 아래 이메일을 통해 연락해 주시기 바랍니다:
                        </p>
                        <p className="mb-4">이메일: kscodebase@gmail.com</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 기타</h2>
                        <p className="mb-4">
                            본 개인정보처리방침은 2025년 01월 01일부터 적용됩니다. 운영자는 관련 법령, 정책, 서비스
                            내용의 변경에 따라 개인정보처리방침을 변경할 수 있으며, 변경 시 공지사항을 통해 안내해
                            드립니다.
                        </p>
                    </section>

                    <div className="mt-12 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-on-primary bg-primary focus:outline-none  transition-colors duration-200"
                        >
                            메인 페이지로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
