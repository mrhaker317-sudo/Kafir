'use client';

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Printer, RotateCw, AlertCircle } from "lucide-react";

export default function Home() {
  const [exam, setExam] = useState("ssc");
  const [year, setYear] = useState("2024");
  const [board, setBoard] = useState("-1");
  const [roll, setRoll] = useState("");
  const [reg, setReg] = useState("");
  
  // Math CAPTCHA (fixed initial values to prevent SSR hydration mismatch)
  const [valueA, setValueA] = useState(3);
  const [valueB, setValueB] = useState(1);
  const [valueS, setValueS] = useState("");

  // Result & loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawHtml, setRawHtml] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setValueA(a);
    setValueB(b);
    setValueS("");
  };

  const handleReset = () => {
    setBoard("-1");
    setRoll("");
    setReg("");
    setError(null);
    setRawHtml(null);
    generateCaptcha();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (board === "-1") {
      setError("Please Select Board!");
      return;
    }
    if (!roll.trim()) {
      setError("Please Enter Exam Roll!");
      return;
    }
    if (!valueS.trim()) {
      setError("Please Enter the Value!");
      return;
    }

    const sum = parseInt(valueS.trim(), 10);
    if (isNaN(sum) || sum !== valueA + valueB) {
      setError("Entered value does not match!");
      generateCaptcha();
      return;
    }

    setLoading(true);
    setRawHtml(null);

    try {
      const res = await fetch("/api/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam,
          year,
          board,
          roll: roll.trim(),
          reg: reg.trim(),
          value_a: valueA,
          value_b: valueB,
          value_s: sum,
        }),
      });

      const data = await res.json();

      if (data.success && data.html) {
        setRawHtml(data.html);
        generateCaptcha();
        setTimeout(() => {
          contentRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        setError(data.error || "RESULT NOT FOUND!");
        generateCaptcha();
      }
    } catch {
      setError("Failed to connect to the result server. Please try again.");
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine if valid result table is present for showing print button
  const hasValidResult =
    rawHtml &&
    !rawHtml.includes("RESULT NOT FOUND!") &&
    !rawHtml.includes("RESULT IS NOT PUBLISHED YET!") &&
    !rawHtml.includes("Entered value does not match!");

  return (
    <div id="printableArea" className="min-h-screen bg-[#EEEEEE] font-[Verdana,Arial,Helvetica,sans-serif] p-[5px_0px_5px_5px]">
      <table className="w-[650px] mx-auto border-0 border-spacing-0 border-collapse">
        <tbody>
          {/* Header Banner */}
          <tr>
            <td>
              <table className="w-full bg-white border-0 border-spacing-0 border-collapse">
                <tbody>
                  <tr>
                    <td className="w-[12px] h-[12px]"></td>
                    <td className="h-[12px]"></td>
                    <td className="w-[12px] h-[12px]"></td>
                  </tr>
                  <tr>
                    <td className="w-[12px] text-left align-top">&nbsp;</td>
                    <td className="align-top">
                      <table className="w-full border-0 border-spacing-0 border-collapse">
                        <tbody>
                          <tr>
                            <td className="w-[142px] h-[121px] text-center align-middle bg-[#007814]">
                              <Image 
                                src="https://i.postimg.cc/RhzS6VC4/bd-logo-(1).png" 
                                alt="Bangladesh Government Logo" 
                                width={82} 
                                height={82}
                                priority
                                className="inline-block"
                                referrerPolicy="no-referrer"
                              />
                            </td>

                            <td className="align-top bg-[#007814]">
                              <table className="w-full border-0 border-spacing-0 border-collapse">
                                <tbody>
                                  <tr>
                                    <td className="text-right">
                                      <table className="w-full border-0 border-spacing-0 border-collapse">
                                        <tbody>
                                          <tr>
                                            <td className="text-left align-middle">
                                              <h1 id="site_title_des" className="font-[Verdana,Arial,Helvetica,sans-serif] text-[17px] text-[#EEEEEE] m-0 ml-[6px] mb-[5px] block font-bold">
                                                Ministry of Education
                                              </h1>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="text-left bg-[#007814]"></td>
                                  </tr>
                                  <tr>
                                    <td className="h-[55px] text-left">
                                      <h1 id="site_title" className="font-[Verdana,Arial,Helvetica,sans-serif] text-[#FFFFEE] text-[17px] m-[3px_0px_0px_5px] font-bold leading-tight">
                                        Intermediate and Secondary Education Boards Bangladesh
                                      </h1>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="text-right">
                                      <table className="w-full border-0 border-spacing-0 border-collapse"></table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="h-[1px] w-[1px]"></div>
                    </td>
                    <td className="w-[12px] text-right align-top">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Form and Content Section */}
          <tr>
            <td>
              <table className="w-[650px] bg-white border-0 border-spacing-0 border-collapse mx-auto">
                <tbody>
                  <tr>
                    <td className="w-[12px] text-left align-top">&nbsp;</td>
                    <td className="align-top">
                      <table className="w-full border-0 border-spacing-0 border-collapse">
                        <tbody>
                          <tr>
                            <td className="h-[12px]">&nbsp;</td>
                          </tr>

                          {/* Form Section */}
                          <tr>
                            <td>
                              <form id="frmPage" onSubmit={handleSubmit}>
                                <table className="w-full border-0 border-spacing-0 border-collapse">
                                  <tbody>
                                    <tr>
                                      <td className="w-[13%]">&nbsp;
                                        <input type="hidden" name="sr" id="sr" value="1" />
                                        <input type="hidden" name="et" id="et" value="2" />
                                      </td>
                                      <td className="w-[74%]">
                                        <fieldset className="border border-[#D1D5DB] p-[10px]">
                                          <table className="w-full border-0 border-spacing-0 border-collapse font-[Verdana,Arial,Helvetica,sans-serif] text-[12px] text-black font-bold">
                                            <tbody>
                                              <tr className="h-[6px]">
                                                <td className="w-[12%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[24%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[7%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[46%] text-right align-middle">&nbsp;</td>
                                                <td className="w-[11%] text-left align-middle">&nbsp;</td>
                                              </tr>

                                              {/* Examination */}
                                              <tr className="h-[30px]">
                                                <td className="w-[12%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[24%] text-left align-middle text-black font-bold whitespace-nowrap">Examination</td>
                                                <td className="w-[7%] text-left align-middle">:</td>
                                                <td className="w-[46%] text-right align-middle">
                                                  <select 
                                                    name="exam" 
                                                    id="exam" 
                                                    value={exam}
                                                    onChange={(e) => setExam(e.target.value)}
                                                    className="w-[205px] h-[26px] bg-[#F4F0F2] border border-[#999] rounded-[4px] px-1 py-1 font-normal text-[12px] text-black font-[Verdana,Arial,Helvetica,sans-serif] focus:outline-none"
                                                  >
                                                    <option value="ssc">SSC/Dakhil/Equivalent</option>
                                                    <option value="jsc">JSC/JDC</option>
                                                    <option value="ssc_voc">SSC/Vocational</option>
                                                    <option value="hsc">HSC/Alim/Equivalent</option>
                                                    <option value="hsc_voc">HSC/Vocational</option>
                                                    <option value="hsc_bm">HSC/BM</option>
                                                    <option value="dc">Diploma in Commerce</option>
                                                    <option value="dbs">Diploma in Business Studies</option>
                                                  </select>
                                                </td>
                                                <td className="w-[11%] text-left align-middle">&nbsp;</td>
                                              </tr>

                                              {/* Year */}
                                              <tr className="h-[30px]">
                                                <td className="w-[12%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[24%] text-left align-middle text-black font-bold">Year</td>
                                                <td className="w-[7%] text-left align-middle">:</td>
                                                <td className="w-[46%] text-right align-middle">
                                                  <select 
                                                    name="year" 
                                                    id="year" 
                                                    value={year}
                                                    onChange={(e) => setYear(e.target.value)}
                                                    className="w-[205px] h-[26px] bg-[#F4F0F2] border border-[#999] rounded-[4px] px-1 py-1 font-normal text-[12px] text-black font-[Verdana,Arial,Helvetica,sans-serif] focus:outline-none"
                                                  >
                                                    {Array.from({ length: 2026 - 1996 + 1 }, (_, i) => 2026 - i).map((y) => (
                                                      <option key={y} value={String(y)}>{y}</option>
                                                    ))}
                                                  </select>
                                                </td>
                                                <td className="w-[11%] text-left align-middle">&nbsp;</td>
                                              </tr>

                                              {/* Board */}
                                              <tr className="h-[30px]">
                                                <td className="w-[12%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[24%] text-left align-middle text-black font-bold">Board</td>
                                                <td className="w-[7%] text-left align-middle">:</td>
                                                <td className="w-[46%] text-right align-middle">
                                                  <select 
                                                    name="board" 
                                                    id="board" 
                                                    value={board}
                                                    onChange={(e) => {
                                                      setBoard(e.target.value);
                                                      setError(null);
                                                    }}
                                                    className="w-[205px] h-[26px] bg-[#F4F0F2] border border-[#999] rounded-[4px] px-1 py-1 font-normal text-[12px] text-black font-[Verdana,Arial,Helvetica,sans-serif] focus:outline-none"
                                                  >
                                                    <option value="-1">Select One</option>
                                                    <option value="barisal">Barisal</option>
                                                    <option value="chittagong">Chittagong</option>
                                                    <option value="comilla">Comilla</option>
                                                    <option value="dhaka">Dhaka</option>
                                                    <option value="dinajpur">Dinajpur</option>
                                                    <option value="jessore">Jessore</option>
                                                    <option value="mymensingh">Mymensingh</option>
                                                    <option value="rajshahi">Rajshahi</option>
                                                    <option value="sylhet">Sylhet</option>
                                                    <option value="madrasah">Madrasah</option>
                                                    <option value="tec">Technical</option>
                                                    <option value="dibs">DIBS(Dhaka)</option>
                                                  </select>
                                                </td>
                                                <td className="w-[11%] text-left align-middle">&nbsp;</td>
                                              </tr>

                                              {/* Roll */}
                                              <tr className="h-[30px]">
                                                <td className="w-[12%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[24%] text-left align-middle text-black font-bold">Roll</td>
                                                <td className="w-[7%] text-left align-middle">:</td>
                                                <td className="w-[46%] text-right align-middle">
                                                  <input 
                                                    name="roll" 
                                                    type="text" 
                                                    id="roll" 
                                                    value={roll}
                                                    onChange={(e) => {
                                                      const val = e.target.value.replace(/\D/g, "");
                                                      setRoll(val);
                                                      setError(null);
                                                    }}
                                                    maxLength={8} 
                                                    className="w-[200px] h-[26px] bg-[#F4F0F2] border border-[#999] rounded-[4px] px-1 py-1 font-normal text-[12px] text-black font-[Verdana,Arial,Helvetica,sans-serif] focus:outline-none" 
                                                  />
                                                </td>
                                                <td className="w-[11%] text-left align-middle">&nbsp;</td>
                                              </tr>

                                              {/* Registration */}
                                              <tr className="h-[30px]">
                                                <td className="w-[12%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[24%] text-left align-middle text-black font-bold whitespace-nowrap">Reg: No</td>
                                                <td className="w-[7%] text-left align-middle">:</td>
                                                <td className="w-[46%] text-right align-middle">
                                                  <input 
                                                    name="reg" 
                                                    type="text" 
                                                    id="reg" 
                                                    value={reg}
                                                    onChange={(e) => {
                                                      const val = e.target.value.replace(/\D/g, "");
                                                      setReg(val);
                                                    }}
                                                    maxLength={10} 
                                                    className="w-[200px] h-[26px] bg-[#F4F0F2] border border-[#999] rounded-[4px] px-1 py-1 font-normal text-[12px] text-black font-[Verdana,Arial,Helvetica,sans-serif] focus:outline-none" 
                                                  />
                                                </td>
                                                <td className="w-[11%] text-left align-middle">&nbsp;</td>
                                              </tr>

                                              {/* Captcha */}
                                              <tr className="h-[30px]">
                                                <td className="w-[12%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[24%] text-left align-middle text-black font-bold">
                                                  <div id="captcha" className="inline-flex items-center gap-1.5">
                                                    <span>{valueA} + {valueB}</span>
                                                    <button 
                                                      type="button" 
                                                      onClick={generateCaptcha} 
                                                      title="Refresh Captcha"
                                                      className="text-gray-500 hover:text-black cursor-pointer ml-1 no-print"
                                                    >
                                                      <RotateCw className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                                </td>
                                                <td className="w-[7%] text-left align-middle">=</td>
                                                <td className="w-[46%] text-right align-middle">
                                                  <input 
                                                    name="value_s" 
                                                    type="text" 
                                                    id="value_s" 
                                                    value={valueS}
                                                    onChange={(e) => {
                                                      const val = e.target.value.replace(/\D/g, "");
                                                      setValueS(val);
                                                      setError(null);
                                                    }}
                                                    maxLength={4} 
                                                    className="w-[200px] h-[26px] bg-[#F4F0F2] border border-[#999] rounded-[4px] px-1 py-1 font-normal text-[12px] text-black font-[Verdana,Arial,Helvetica,sans-serif] focus:outline-none" 
                                                  />
                                                </td>
                                                <td className="w-[11%] text-left align-middle">&nbsp;</td>
                                              </tr>

                                              {/* Action Buttons */}
                                              <tr className="h-[46px]">
                                                <td className="w-[12%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[24%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[7%] text-left align-middle">&nbsp;</td>
                                                <td className="w-[46%] text-left align-middle pt-2 pb-1 whitespace-nowrap">
                                                  <input 
                                                    type="button" 
                                                    name="reset" 
                                                    id="reset" 
                                                    value="Reset" 
                                                    onClick={handleReset}
                                                    className="inline-block h-[38px] px-[25px] text-white bg-[#ff0000] hover:bg-[#d60000] text-center text-[11px] font-semibold leading-[38px] tracking-[.1rem] uppercase no-underline whitespace-nowrap rounded-[4px] border border-[#bbb] cursor-pointer mr-[5px] transition" 
                                                  />
                                                  <button 
                                                    type="submit" 
                                                    name="btnSubmit" 
                                                    id="btnSubmit" 
                                                    disabled={loading}
                                                    className="inline-flex items-center justify-center h-[38px] px-[25px] text-white bg-[#51ae22] hover:bg-[#45961d] text-center text-[11px] font-semibold leading-[38px] tracking-[.1rem] uppercase no-underline whitespace-nowrap rounded-[4px] border border-[#bbb] cursor-pointer transition disabled:opacity-50"
                                                  >
                                                    {loading ? (
                                                      <span className="flex items-center gap-1">
                                                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                                        Searching...
                                                      </span>
                                                    ) : (
                                                      "Submit"
                                                    )}
                                                  </button>
                                                </td>
                                                <td className="w-[11%] text-left align-middle">&nbsp;</td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </fieldset>
                                      </td>
                                      <td className="w-[13%]">&nbsp;</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </form>
                            </td>
                          </tr>

                          {/* Error Indicator */}
                          {error && (
                            <tr>
                              <td className="pt-3 pb-2 text-center">
                                <table className="w-[74%] mx-auto border-0 border-spacing-0 border-collapse">
                                  <tbody>
                                    <tr>
                                      <td className="p-3 bg-red-50 border border-red-200 rounded text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-[#F00] font-[Verdana,Arial,Helvetica,sans-serif] text-[12px] font-bold">
                                          <AlertCircle className="w-4 h-4 text-red-600" />
                                          <span>{error}</span>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}

                          {/* Results Region */}
                          <tr>
                            <td className="pt-2">
                              <div ref={contentRef} id="contentRegion" className="w-[95%] mx-auto">
                                {loading && (
                                  <div className="text-center py-6 text-gray-600 text-[12px]">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#51ae22] mb-2"></div>
                                    <p>Please wait, fetching result from education board server...</p>
                                  </div>
                                )}

                                {/* Authentic HTML Response directly from Teletalk result.php */}
                                {rawHtml && (
                                  <div 
                                    className="my-3 text-[12px] text-center" 
                                    dangerouslySetInnerHTML={{ __html: rawHtml }} 
                                  />
                                )}

                                {/* Print & Search Again Buttons */}
                                {hasValidResult && (
                                  <div className="flex items-center justify-center gap-3 my-4 no-print">
                                    <button
                                      type="button"
                                      onClick={handlePrint}
                                      id="btnPrint"
                                      className="inline-flex items-center gap-2 h-[38px] px-6 text-white bg-[#51ae22] hover:bg-[#45961d] text-[11px] font-semibold tracking-wider uppercase rounded border border-[#bbb] cursor-pointer transition shadow-sm"
                                    >
                                      <Printer className="w-4 h-4" />
                                      Print
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleReset}
                                      className="inline-flex items-center gap-2 h-[38px] px-5 text-gray-700 bg-gray-100 hover:bg-gray-200 text-[11px] font-semibold tracking-wider uppercase rounded border border-[#bbb] cursor-pointer transition"
                                    >
                                      Search Again
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td className="h-[25px]">&nbsp;</td>
                          </tr>

                          {/* Footer */}
                          <tr>
                            <td>
                              <table className="w-full border-0 border-spacing-0 border-collapse pb-[10px] pt-[10px]">
                                <tbody>
                                  <tr>
                                    <td colSpan={5} className="h-[1px]"></td>
                                  </tr>
                                  <tr className="bg-[#F2F2F2]">
                                    <td className="w-[5px] text-left align-bottom bg-[#F2F2F2] font-[Verdana,Arial,Helvetica,sans-serif] text-[10px] text-[#666666] leading-[15px]"></td>
                                    <td className="w-[356px] h-[70px] text-left align-middle bg-[#F2F2F2] font-[Verdana,Arial,Helvetica,sans-serif] text-[10px] text-[#666666] leading-[15px] pl-1">
                                      &copy;2005-2026 Ministry of Education, All rights reserved.
                                    </td>
                                    <td className="w-[150px] h-[70px] text-right align-middle bg-[#F2F2F2] font-[Verdana,Arial,Helvetica,sans-serif] text-[10px] text-[#666666] leading-[15px] pr-2">
                                      Powered by
                                    </td>
                                    <td className="w-[110px] h-[70px] text-center align-middle bg-[#F2F2F2]">
                                      <Image 
                                        src="https://i.postimg.cc/4dnKX382/tbl-logo.png" 
                                        alt="Teletalk Logo" 
                                        width={83} 
                                        height={44}
                                        className="inline-block"
                                        referrerPolicy="no-referrer"
                                      />
                                    </td>
                                    <td className="w-[5px] text-left align-bottom bg-[#F2F2F2] font-[Verdana,Arial,Helvetica,sans-serif] text-[10px] text-[#666666] leading-[15px]"></td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td className="w-[12px] text-right align-top">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
