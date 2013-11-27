package org.aksw.facete.web.api.domain;


public class ConceptDesc {
	private String elementStr;
	private String varName;
	public String getElementStr() {
		return elementStr;
	}
	public void setElementStr(String elementStr) {
		this.elementStr = elementStr;
	}
	public String getVarName() {
		return varName;
	}
	public void setVarName(String varName) {
		this.varName = varName;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((elementStr == null) ? 0 : elementStr.hashCode());
		result = prime * result + ((varName == null) ? 0 : varName.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ConceptDesc other = (ConceptDesc) obj;
		if (elementStr == null) {
			if (other.elementStr != null)
				return false;
		} else if (!elementStr.equals(other.elementStr))
			return false;
		if (varName == null) {
			if (other.varName != null)
				return false;
		} else if (!varName.equals(other.varName))
			return false;
		return true;
	}
	@Override
	public String toString() {
		return "ConceptDesc [elementStr=" + elementStr + ", varName=" + varName
				+ "]";
	}
	
	
}